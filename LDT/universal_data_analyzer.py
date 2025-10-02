#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Универсальный анализатор данных с локальной LLM через Ollama.
Поддерживает CSV, JSON, XML, Excel, Parquet с автоматическим определением формата,
устойчивым парсингом и детальной аналитикой.
Версия с улучшенным автоопределением разделителя для CSV.
"""

import os
import json
import sys
import argparse
import logging
import textwrap
import time
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Tuple, Optional, Union
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Внешние зависимости
REQUIRED_PACKAGES = {
    'pandas': 'pip install pandas',
    'lxml': 'pip install lxml', 
    'ollama': 'pip install ollama'
}

OPTIONAL_PACKAGES = {
    'openpyxl': 'pip install openpyxl',
    'pyarrow': 'pip install pyarrow',
    'rich': 'pip install rich'
}

def check_and_import_required():
    missing = []
    for package, install_cmd in REQUIRED_PACKAGES.items():
        try:
            globals()[package] = __import__(package)
        except ImportError:
            missing.append(f"{package}: {install_cmd}")
    
    if missing:
        print("Отсутствуют обязательные пакеты:")
        for pkg in missing:
            print(f"  {pkg}")
        sys.exit(1)

def check_and_import_optional():
    available = {}
    for package in OPTIONAL_PACKAGES.keys():
        try:
            available[package] = __import__(package)
        except ImportError:
            available[package] = None
    return available

check_and_import_required()
optional_packages = check_and_import_optional()

import pandas as pd
import subprocess
import csv
from lxml import etree

# Опциональные импорты
try:
    import ollama
    OLLAMA_CLIENT_OK = True
except ImportError:
    OLLAMA_CLIENT_OK = False

try:
    from rich.console import Console
    from rich.progress import Progress, SpinnerColumn, TextColumn
    from rich.table import Table
    from rich.panel import Panel
    RICH_OK = True
except ImportError:
    RICH_OK = False

# Константы
DEFAULT_INPUT_DIR = "input"
DEFAULT_OUTPUT_DIR = "output"
SUPPORTED_EXTS = {".csv", ".tsv", ".json", ".xml", ".xlsx", ".xls", ".parquet"}
DEFAULT_MODEL = "qwen3:30b"

class DateTimeJSONEncoder(json.JSONEncoder):
    """Кастомный JSON encoder для datetime объектов"""
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        if hasattr(obj, '__dict__'):
            return obj.__dict__
        return super().default(obj)

def safe_json_dumps(obj, **kwargs):
    """Безопасная сериализация в JSON с обработкой datetime"""
    return json.dumps(obj, cls=DateTimeJSONEncoder, **kwargs)

@dataclass
class FileInfo:
    """Информация о файле"""
    path: str
    format: str
    size_bytes: int
    modified: datetime
    
    def to_dict(self):
        """Конвертация в словарь с сериализуемыми типами"""
        return {
            "path": self.path,
            "format": self.format,
            "size_bytes": self.size_bytes,
            "modified": self.modified.isoformat(),
            "size_mb": round(self.size_bytes / 1024 / 1024, 2)
        }
        
@dataclass  
class AnalysisConfig:
    """Конфигурация анализа"""
    input_dir: str
    output_dir: Optional[str]
    model_name: str
    sample_rows: int
    max_chars: int
    expected_cols: Optional[int]
    file_pattern: Optional[str]
    save_results: bool
    verbose: bool
    force_separator: Optional[str] = None  # Принудительный разделитель

@dataclass
class ColumnInfo:
    """Информация о столбце"""
    name: str
    dtype: str
    non_null_count: int
    null_count: int
    null_percentage: float
    unique_count: int
    example_values: List[Any]
    
    def to_dict(self):
        """Конвертация в словарь"""
        return {
            "name": self.name,
            "dtype": self.dtype,
            "non_null_count": self.non_null_count,
            "null_count": self.null_count,
            "null_percentage": round(self.null_percentage, 2),
            "unique_count": self.unique_count,
            "example_values": [str(v) for v in self.example_values]  # Приводим к строкам
        }
        
@dataclass
class DataOverview:
    """Обзор данных"""
    file_info: FileInfo
    data_type: str
    rows: int
    cols: int
    columns: List[ColumnInfo]
    memory_usage_mb: float
    separator_info: Optional[Dict[str, Any]] = None
    read_attempts: Optional[List[Tuple[Dict, str]]] = None
    
    def to_dict(self):
        """Конвертация в словарь"""
        result = {
            "file_info": self.file_info.to_dict(),
            "data_type": self.data_type,
            "rows": self.rows,
            "cols": self.cols,
            "columns": [col.to_dict() for col in self.columns],
            "memory_usage_mb": round(self.memory_usage_mb, 2)
        }
        if self.separator_info:
            result["separator_info"] = self.separator_info
        if self.read_attempts:
            result["read_attempts"] = self.read_attempts
        return result

class Logger:
    """Простой логгер с поддержкой rich"""
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.console = Console() if RICH_OK else None
        
        # Настройка стандартного логгера
        logging.basicConfig(
            level=logging.DEBUG if verbose else logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[logging.StreamHandler(sys.stderr)]
        )
        self.logger = logging.getLogger(__name__)
    
    def info(self, message: str):
        if self.console:
            self.console.print(f"[blue]ℹ[/blue] {message}")
        else:
            print(f"ℹ {message}")
        self.logger.info(message)
    
    def success(self, message: str):
        if self.console:
            self.console.print(f"[green]✓[/green] {message}")
        else:
            print(f"✓ {message}")
        self.logger.info(message)
    
    def warning(self, message: str):
        if self.console:
            self.console.print(f"[yellow]⚠[/yellow] {message}")
        else:
            print(f"⚠ {message}")
        self.logger.warning(message)
    
    def error(self, message: str):
        if self.console:
            self.console.print(f"[red]✗[/red] {message}")
        else:
            print(f"✗ {message}")
        self.logger.error(message)
        
    def debug(self, message: str):
        if self.verbose:
            if self.console:
                self.console.print(f"[dim]Debug: {message}[/dim]")
            else:
                print(f"Debug: {message}")
        self.logger.debug(message)

class FileHandler:
    """Обработчик файлов"""
    
    def __init__(self, logger: Logger):
        self.logger = logger
    
    def find_files(self, input_dir: str, pattern: Optional[str] = None) -> List[FileInfo]:
        """Найти все поддерживаемые файлы"""
        if not os.path.isdir(input_dir):
            raise FileNotFoundError(f"Директория {input_dir} не найдена")
        
        files = []
        for path in Path(input_dir).rglob("*"):
            if path.is_file() and path.suffix.lower() in SUPPORTED_EXTS:
                if pattern and pattern not in path.name:
                    continue
                
                stat = path.stat()
                files.append(FileInfo(
                    path=str(path),
                    format=self.detect_format(str(path)),
                    size_bytes=stat.st_size,
                    modified=datetime.fromtimestamp(stat.st_mtime)
                ))
        
        return sorted(files, key=lambda f: f.modified, reverse=True)
    
    def detect_format(self, path: str) -> str:
        """Определить формат файла"""
        ext = Path(path).suffix.lower()
        format_map = {
            ".csv": "csv",
            ".tsv": "tsv", 
            ".json": "json",
            ".xml": "xml",
            ".xlsx": "excel",
            ".xls": "excel",
            ".parquet": "parquet"
        }
        return format_map.get(ext, "unknown")

class CSVReader:
    """Устойчивый читатель CSV с автоопределением разделителя"""
    
    def __init__(self, logger: Logger):
        self.logger = logger
    
    def detect_separator(self, path: str, sample_lines: int = 10, encoding: str = 'utf-8') -> Tuple[str, Dict[str, Any]]:
        """Автоматическое определение разделителя CSV"""
        separators = [';', ',', '\t', '|']  # Приоритет точке с запятой
        separator_scores = {}
        
        # Пробуем разные кодировки
        encodings_to_try = [encoding, 'utf-8', 'cp1251', 'iso-8859-1']
        sample_content = []
        used_encoding = encoding
        
        for enc in encodings_to_try:
            try:
                with open(path, 'r', encoding=enc, errors='replace') as f:
                    sample_content = []
                    for i, line in enumerate(f):
                        if i >= sample_lines:
                            break
                        sample_content.append(line.strip())
                used_encoding = enc
                break
            except Exception as e:
                self.logger.debug(f"Кодировка {enc} не подошла: {e}")
                continue
        
        if not sample_content:
            self.logger.warning("Не удалось прочитать файл ни в одной кодировке")
            return ',', {"error": "encoding_failed", "encoding": used_encoding}
        
        self.logger.debug(f"Используется кодировка: {used_encoding}")
        
        # Считаем количество каждого разделителя в каждой строке
        for sep in separators:
            counts = []
            for line in sample_content:
                if line.strip():  # Игнорируем пустые строки
                    counts.append(line.count(sep))
            
            if not counts:
                continue
                
            # Оценка разделителя
            max_count = max(counts)
            if max_count > 0:
                # Проверяем консистентность (большинство строк должно иметь одинаковое количество разделителей)
                most_common_count = max(set(counts), key=counts.count)
                consistency = counts.count(most_common_count) / len(counts)
                
                # Средние количество колонок
                avg_columns = most_common_count + 1
                
                # Итоговый скор: приоритет консистентности и количеству колонок
                score = consistency * avg_columns
                
                separator_scores[sep] = {
                    'score': score,
                    'consistency': consistency,
                    'avg_columns': avg_columns,
                    'counts': counts,
                    'most_common_count': most_common_count
                }
        
        if not separator_scores:
            self.logger.warning("Не удалось автоматически определить разделитель, используем ','")
            return ',', {"error": "no_separator_detected", "encoding": used_encoding}
        
        # Выбираем лучший разделитель
        best_sep = max(separator_scores.keys(), key=lambda x: separator_scores[x]['score'])
        best_info = separator_scores[best_sep]
        
        # Подробная информация о детекции
        detection_info = {
            "detected_separator": best_sep,
            "separator_name": self._get_separator_name(best_sep),
            "expected_columns": int(best_info['avg_columns']),
            "consistency": round(best_info['consistency'], 3),
            "score": round(best_info['score'], 3),
            "encoding": used_encoding,
            "all_separators": {
                self._get_separator_name(sep): {
                    "score": round(info['score'], 3),
                    "columns": int(info['avg_columns']),
                    "consistency": round(info['consistency'], 3)
                }
                for sep, info in separator_scores.items()
            }
        }
        
        self.logger.info(f"Определен разделитель: '{self._get_separator_name(best_sep)}' ({best_sep}) - ожидается {best_info['avg_columns']} колонок")
        
        return best_sep, detection_info
    
    def _get_separator_name(self, sep: str) -> str:
        """Получить человекочитаемое имя разделителя"""
        names = {
            ',': 'запятая',
            ';': 'точка с запятой',
            '\t': 'табуляция',
            '|': 'вертикальная черта'
        }
        return names.get(sep, f"'{sep}'")
    
    def diagnose_csv_structure(self, path: str, lines_to_check: int = 5):
        """Диагностика структуры CSV файла"""
        self.logger.info("=== ДИАГНОСТИКА CSV ===")
        
        # Читаем первые строки
        encodings = ['utf-8', 'cp1251', 'iso-8859-1']
        lines = []
        used_encoding = 'utf-8'
        
        for encoding in encodings:
            try:
                with open(path, 'r', encoding=encoding, errors='replace') as f:
                    lines = [f.readline().strip() for _ in range(lines_to_check)]
                used_encoding = encoding
                break
            except:
                continue
        
        print(f"Кодировка: {used_encoding}")
        print(f"Первые {len(lines)} строк файла:")
        for i, line in enumerate(lines[:3]):
            print(f"  {i+1}: {line[:150]}{'...' if len(line) > 150 else ''}")
        
        print("\nАнализ разделителей:")
        separators = [',', ';', '\t', '|']
        for sep in separators:
            sep_name = self._get_separator_name(sep)
            counts = [line.count(sep) for line in lines if line.strip()]
            if counts:
                max_count = max(counts)
                avg_count = sum(counts) / len(counts)
                consistency = counts.count(max_count) / len(counts) if max_count > 0 else 0
                print(f"  {sep_name}: макс={max_count}, среднее={avg_count:.1f}, консистентность={consistency:.1f}")
        print()
    
    def robust_read_csv(self, path: str, expected_cols: Optional[int] = None, 
                       prefer_seps: Optional[Tuple[str, ...]] = None,
                       force_separator: Optional[str] = None) -> Tuple[pd.DataFrame, List[Tuple[Dict, str]], Dict[str, Any]]:
        """Устойчивое чтение CSV с перебором конфигураций"""
        attempts = []
        separator_info = {}
        
        # Принудительный разделитель
        if force_separator:
            prefer_seps = (force_separator,)
            separator_info = {"forced_separator": force_separator}
            self.logger.info(f"Используется принудительный разделитель: '{self._get_separator_name(force_separator)}'")
        elif prefer_seps is None:
            # Автоопределение разделителя
            detected_sep, separator_info = self.detect_separator(path)
            prefer_seps = (detected_sep, ";", ",", "\t", "|")
            self.logger.debug(f"Автоопределение дало разделитель: '{detected_sep}'")
        
        configs = self._generate_configs(prefer_seps)
        
        # Убираем дубликаты
        seen = set()
        unique_configs = []
        for cfg in configs:
            key = tuple(sorted(cfg.items()))
            if key not in seen:
                seen.add(key)
                unique_configs.append(cfg)
        
        self.logger.debug(f"Попыток чтения CSV: {len(unique_configs)}")
        
        last_err = None
        best_df = None
        best_attempts = []
        best_cols_count = 0
        
        # Ограничиваем количество попыток для производительности
        for i, cfg in enumerate(unique_configs[:25]):
            try:
                self.logger.debug(f"Попытка {i+1}: {cfg}")
                df = pd.read_csv(path, **cfg)
                
                attempt_info = (cfg, f"OK: {df.shape[0]} строк, {df.shape[1]} столбцов")
                attempts.append(attempt_info)
                
                # Логика выбора лучшего результата
                is_better = False
                
                # Если задано ожидаемое количество столбцов
                if expected_cols:
                    if df.shape[1] == expected_cols:
                        self.logger.success(f"CSV прочитан с ожидаемым количеством столбцов: {df.shape[0]} строк, {df.shape[1]} столбцов")
                        return df, attempts, separator_info
                    elif df.shape[1] > best_cols_count and df.shape[1] <= expected_cols * 1.5:
                        is_better = True
                else:
                    # Предпочитаем больше столбцов (обычно означает правильный разбор)
                    if df.shape[1] > best_cols_count:
                        is_better = True
                
                if is_better:
                    best_df = df
                    best_attempts = attempts.copy()
                    best_cols_count = df.shape[1]
                
                # Если у нас достаточно столбцов и нет конкретных ожиданий
                if not expected_cols and df.shape[1] >= 5:
                    self.logger.success(f"CSV прочитан успешно: {df.shape[0]} строк, {df.shape[1]} столбцов")
                    return df, attempts, separator_info
                    
            except Exception as e:
                last_err = e
                error_msg = str(e)[:200].replace('\n', ' ')
                attempts.append((cfg, f"ERR: {error_msg}"))
        
        # Возвращаем лучший найденный результат
        if best_df is not None:
            if best_cols_count > 1:
                self.logger.success(f"Использован лучший результат: {best_df.shape[0]} строк, {best_cols_count} столбцов")
            else:
                self.logger.warning(f"Найден только вариант с {best_cols_count} столбцом. Возможно, проблема с разделителем.")
            return best_df, best_attempts, separator_info
        
        # Если все попытки провалились
        error_msg = f"Все попытки чтения CSV провалились. Последняя ошибка: {last_err}"
        self.logger.error(error_msg)
        raise RuntimeError(error_msg)
    
    def _generate_configs(self, prefer_seps: Tuple[str, ...]) -> List[Dict[str, Any]]:
        """Генерация конфигураций для чтения CSV"""
        configs = []
        
        for sep in prefer_seps:
            # Простые конфигурации в первую очередь (быстрее)
            configs.extend([
                {"sep": sep},  # C engine - самый быстрый
                {"sep": sep, "skipinitialspace": True},
                {"engine": "python", "sep": sep},
                {"engine": "python", "sep": sep, "quotechar": '"'},
                {"engine": "python", "sep": sep, "quotechar": '"', "skipinitialspace": True},
            ])
            
            # Конфигурации для проблематичных файлов
            configs.extend([
                {"engine": "python", "sep": sep, "on_bad_lines": "skip"},
                {"engine": "python", "sep": sep, "quotechar": '"', "escapechar": "\\"},
                {"engine": "python", "sep": sep, "quotechar": '"', "escapechar": "\\", "on_bad_lines": "skip"},
                {"engine": "python", "sep": sep, "encoding": "utf-8-sig"},
                {"engine": "python", "sep": sep, "encoding": "cp1251"},
                {"engine": "python", "sep": sep, "decimal": ",", "on_bad_lines": "skip"},
                {"engine": "python", "sep": sep, "thousands": " ", "on_bad_lines": "skip"},
            ])
        
        return configs

class DataAnalyzer:
    """Основной класс анализа данных"""
    
    def __init__(self, config: AnalysisConfig):
        self.config = config
        self.logger = Logger(config.verbose)
        self.file_handler = FileHandler(self.logger)
        self.csv_reader = CSVReader(self.logger)
    
    def analyze_file(self, file_info: FileInfo) -> Dict[str, Any]:
        """Анализ одного файла"""
        self.logger.info(f"Анализ файла: {file_info.path} ({file_info.format})")
        
        try:
            if file_info.format in ["csv", "tsv"]:
                return self._analyze_csv(file_info)
            elif file_info.format == "json":
                return self._analyze_json(file_info)
            elif file_info.format == "xml":
                return self._analyze_xml(file_info)
            elif file_info.format == "excel":
                return self._analyze_excel(file_info)
            elif file_info.format == "parquet":
                return self._analyze_parquet(file_info)
            else:
                raise ValueError(f"Неподдерживаемый формат: {file_info.format}")
                
        except Exception as e:
            self.logger.error(f"Ошибка анализа файла {file_info.path}: {e}")
            raise
    
    def _analyze_csv(self, file_info: FileInfo) -> Dict[str, Any]:
        """Анализ CSV файла"""
        
        # Добавляем диагностику в verbose режиме
        if self.config.verbose:
            self.csv_reader.diagnose_csv_structure(file_info.path)
        
        df = None
        attempts = []
        separator_info = {}
        
        # Сначала пробуем стандартный способ (быстро)
        try:
            df = pd.read_csv(file_info.path)
            attempts = [({"method": "standard_pandas"}, f"OK: {df.shape[0]} строк, {df.shape[1]} столбцов")]
            
            # Проверяем результат - если только 1 столбец, скорее всего проблема с разделителем
            if df.shape[1] == 1:
                first_value = str(df.iloc[0, 0]) if len(df) > 0 else ""
                if ';' in first_value or '\t' in first_value:
                    self.logger.warning("Стандартное чтение дало 1 столбец, но в данных есть другие разделители. Пробуем устойчивое чтение.")
                    df = None  # Сбросим результат для перехода к устойчивому чтению
                
        except Exception as e:
            attempts = [({"method": "standard_pandas"}, f"FAILED: {str(e)[:100]}")]
            self.logger.debug(f"Стандартное чтение не сработало: {e}")
        
        # Если стандартное чтение не сработало ИЛИ дало подозрительный результат
        if df is None or df.shape[1] <= 1:
            self.logger.info("Переходим к устойчивому чтению с автоопределением разделителя...")
            
            # Определяем предпочтительные разделители
            prefer_seps = None
            if file_info.format == "tsv":
                prefer_seps = ("\t", ";", ",", "|")
            
            # Устойчивое чтение
            df, robust_attempts, separator_info = self.csv_reader.robust_read_csv(
                file_info.path, 
                expected_cols=self.config.expected_cols,
                prefer_seps=prefer_seps,
                force_separator=self.config.force_separator
            )
            attempts.extend(robust_attempts)
        
        # Создаем обзор
        overview = self._create_dataframe_overview(df, file_info)
        overview.separator_info = separator_info
        overview.read_attempts = attempts
        
        # Безопасное получение sample для больших датафреймов
        sample_df = df.head(self.config.sample_rows)
        sample = []
        
        for _, row in sample_df.iterrows():
            row_dict = {}
            for col, val in row.items():
                # Конвертируем все значения в строки для безопасной сериализации
                if pd.isna(val):
                    row_dict[str(col)] = None
                elif isinstance(val, (pd.Timestamp, datetime)):
                    row_dict[str(col)] = val.isoformat() if hasattr(val, 'isoformat') else str(val)
                else:
                    row_dict[str(col)] = str(val)
            sample.append(row_dict)
        
        return {
            "overview": overview.to_dict(),
            "sample": sample,
            "statistics": self._get_dataframe_statistics(df)
        }
    
    def _analyze_json(self, file_info: FileInfo) -> Dict[str, Any]:
        """Анализ JSON файла"""
        with open(file_info.path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        def summarize_structure(obj, depth=0, max_depth=3):
            if depth > max_depth:
                return "...depth limit..."
            if isinstance(obj, dict):
                return {k: summarize_structure(v, depth+1, max_depth) 
                       for k, v in list(obj.items())[:20]}
            elif isinstance(obj, list):
                return [summarize_structure(v, depth+1, max_depth) 
                       for v in obj[:10]]
            return type(obj).__name__
        
        # Попытка табличного представления
        table_overview = None
        if isinstance(data, list) and all(isinstance(x, dict) for x in data[:100] if x):
            df = pd.DataFrame(data)
            table_overview = self._create_dataframe_overview(df, file_info)
            sample = df.head(self.config.sample_rows).to_dict(orient="records")
        else:
            sample = data[:self.config.sample_rows] if isinstance(data, list) else data
        
        overview = {
            "file_info": file_info.to_dict(),
            "data_type": "json",
            "root_type": type(data).__name__,
            "structure_preview": summarize_structure(data)
        }
        
        if table_overview:
            overview["table_like"] = table_overview.to_dict()
        
        return {"overview": overview, "sample": sample}
    
    def _analyze_xml(self, file_info: FileInfo) -> Dict[str, Any]:
        """Анализ XML файла"""
        tree = etree.parse(file_info.path)
        root = tree.getroot()
        
        def element_signature(elem):
            return {
                "tag": elem.tag,
                "attributes": sorted(elem.attrib.keys()),
                "children_tags": sorted({child.tag for child in elem}),
                "has_text": bool((elem.text or "").strip())
            }
        
        # Статистика по тегам
        tag_counts = {}
        for elem in root.iter():
            tag_counts[elem.tag] = tag_counts.get(elem.tag, 0) + 1
        
        # Примеры элементов
        samples = []
        for i, elem in enumerate(root.iter()):
            if i >= self.config.sample_rows:
                break
            samples.append({
                "tag": elem.tag,
                "signature": element_signature(elem),
                "text_sample": (elem.text or "").strip()[:200]
            })
        
        overview = {
            "file_info": file_info.to_dict(),
            "data_type": "xml",
            "root_tag": root.tag,
            "unique_tags": len(tag_counts),
            "tag_counts_top": sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:20],
            "total_elements": sum(tag_counts.values())
        }
        
        return {"overview": overview, "sample": samples}
    
    def _analyze_excel(self, file_info: FileInfo) -> Dict[str, Any]:
        """Анализ Excel файла"""
        if not optional_packages.get('openpyxl'):
            raise RuntimeError("Для работы с Excel нужен openpyxl: pip install openpyxl")
        
        # Читаем все листы
        xl_file = pd.ExcelFile(file_info.path)
        sheets_info = {}
        
        for sheet_name in xl_file.sheet_names:
            df = pd.read_excel(file_info.path, sheet_name=sheet_name)
            sheets_info[sheet_name] = {
                "overview": self._create_dataframe_overview(df, file_info).to_dict(),
                "sample": df.head(self.config.sample_rows).to_dict(orient="records")
            }
        
        overview = {
            "file_info": file_info.to_dict(),
            "data_type": "excel", 
            "sheets_count": len(xl_file.sheet_names),
            "sheet_names": xl_file.sheet_names,
            "sheets": sheets_info
        }
        
        return {"overview": overview, "sample": None}
    
    def _analyze_parquet(self, file_info: FileInfo) -> Dict[str, Any]:
        """Анализ Parquet файла"""
        if not optional_packages.get('pyarrow'):
            raise RuntimeError("Для работы с Parquet нужен pyarrow: pip install pyarrow")
        
        df = pd.read_parquet(file_info.path)
        overview = self._create_dataframe_overview(df, file_info)
        sample = df.head(self.config.sample_rows).to_dict(orient="records")
        
        return {
            "overview": overview.to_dict(),
            "sample": sample,
            "statistics": self._get_dataframe_statistics(df)
        }
    
    def _create_dataframe_overview(self, df: pd.DataFrame, file_info: FileInfo) -> DataOverview:
        """Создание обзора для DataFrame"""
        columns = []
        for col in df.columns:
            series = df[col]
            null_count = series.isnull().sum()
            
            # Безопасное получение примеров значений
            example_values = []
            non_null_series = series.dropna()
            for val in non_null_series.head(5):
                if isinstance(val, (pd.Timestamp, datetime)):
                    example_values.append(val.isoformat() if hasattr(val, 'isoformat') else str(val))
                else:
                    example_values.append(val)
            
            columns.append(ColumnInfo(
                name=str(col),
                dtype=str(series.dtype),
                non_null_count=int(series.count()),
                null_count=int(null_count),
                null_percentage=float(null_count / len(df) * 100),
                unique_count=int(series.nunique()),
                example_values=example_values
            ))
        
        return DataOverview(
            file_info=file_info,
            data_type="tabular",
            rows=int(len(df)),
            cols=int(len(df.columns)),
            columns=columns,
            memory_usage_mb=float(df.memory_usage(deep=True).sum() / 1024 / 1024)
        )
    
    def _get_dataframe_statistics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Получение статистики DataFrame"""
        stats = {
            "memory_usage_mb": float(df.memory_usage(deep=True).sum() / 1024 / 1024),
            "dtypes_distribution": {str(k): int(v) for k, v in df.dtypes.value_counts().to_dict().items()},
            "missing_data_summary": {
                "total_missing": int(df.isnull().sum().sum()),
                "columns_with_missing": int((df.isnull().sum() > 0).sum()),
                "rows_with_missing": int(df.isnull().any(axis=1).sum())
            }
        }
        
        # Числовая статистика
        numeric_cols = df.select_dtypes(include=['number']).columns
        if len(numeric_cols) > 0:
            numeric_desc = df[numeric_cols].describe()
            stats["numeric_summary"] = {
                str(col): {str(stat): float(val) for stat, val in numeric_desc[col].items()}
                for col in numeric_desc.columns
            }
        
        return stats

class LLMClient:
    """Клиент для работы с LLM через Ollama"""
    
    def __init__(self, model_name: str, logger: Logger):
        self.model_name = model_name
        self.logger = logger
    
    def analyze_data(self, filename: str, analysis_data: Dict[str, Any]) -> str:
        """Отправка данных на анализ в LLM"""
        prompt = self._build_prompt(filename, analysis_data)
        
        self.logger.info(f"Отправка запроса в {self.model_name}...")
        start_time = time.time()
        
        try:
            response = self._call_ollama(prompt)
            elapsed = time.time() - start_time
            self.logger.success(f"Ответ получен за {elapsed:.1f}с")
            return response
        except Exception as e:
            self.logger.error(f"Ошибка LLM: {e}")
            raise
    
    def _build_prompt(self, filename: str, analysis_data: Dict[str, Any]) -> str:
        """Построение промпта для LLM"""
        def safe_truncate(obj, max_chars=4000):
            s = safe_json_dumps(obj, ensure_ascii=False, indent=2)
            if len(s) > max_chars:
                return s[:max_chars] + "... [truncated]"
            return s
        
        overview = analysis_data.get("overview", {})
        sample = analysis_data.get("sample", {})
        stats = analysis_data.get("statistics", {})
        
        # Добавляем информацию о разделителе, если есть
        separator_info = overview.get("separator_info", {})
        separator_text = ""
        if separator_info:
            sep_name = separator_info.get("separator_name", "неизвестно")
            expected_cols = separator_info.get("expected_columns", "неизвестно")
            separator_text = f"\nИнформация о разделителе: {sep_name}, ожидается столбцов: {expected_cols}"
        
        prompt = f"""
Ты - эксперт по анализу данных. Проанализируй предоставленный набор данных.

Файл: {filename}{separator_text}

СТРУКТУРА ДАННЫХ:
{safe_truncate(overview)}

ПРИМЕРЫ ДАННЫХ:
{safe_truncate(sample)}

СТАТИСТИКА:
{safe_truncate(stats)}

Предоставь:
- Краткое резюме данных (что это за данные, откуда могут быть)
- Анализ структуры и схемы данных  
- Оценка качества данных (пропуски, выбросы, дубликаты)
- Интересные паттерны или аномалии в данных
- Рекомендации по предобработке
- Предложения по анализу и визуализации
- Потенциальные проблемы и риски
- Бизнес-выводы и рекомендации по использованию данных
- предлагать рекомендации оптимального места хранения 
(например: агрегированные аналитические данные – в ClickHouse, сырые – в HDFS, 
оперативные – в PostgreSQL)

Отвечай на русском языке, структурированно, с маркерами и подзаголовками.
"""
        return textwrap.dedent(prompt).strip()
    
    def _call_ollama(self, prompt: str) -> str:
        """Вызов Ollama API"""
        # Пробуем Python клиент
        if OLLAMA_CLIENT_OK:
            try:
                response = ollama.chat(
                    model=self.model_name,
                    messages=[{"role": "user", "content": prompt}]
                )
                return response.get("message", {}).get("content", "").strip()
            except Exception as e:
                self.logger.warning(f"Python клиент Ollama не сработал: {e}, пробуем CLI...")
        
        # Фолбэк на CLI
        try:
            result = subprocess.run(
                ["ollama", "run", self.model_name],
                input=prompt.encode("utf-8"),
                capture_output=True,
                check=True
            )
            return result.stdout.decode("utf-8").strip()
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr.decode("utf-8", errors="ignore")
            raise RuntimeError(f"Ошибка Ollama CLI: {error_msg}")

class ResultSaver:
    """Сохранение результатов анализа"""
    
    def __init__(self, output_dir: str, logger: Logger):
        self.output_dir = Path(output_dir)
        self.logger = logger
        self.output_dir.mkdir(exist_ok=True)
    
    def save_analysis(self, filename: str, analysis_data: Dict[str, Any], llm_response: str) -> str:
        """Сохранение результатов анализа"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = Path(filename).stem
        
        # JSON с полными данными
        json_path = self.output_dir / f"{base_name}_analysis_{timestamp}.json"
        with open(json_path, "w", encoding="utf-8") as f:
            f.write(safe_json_dumps({
                "filename": filename,
                "analysis_data": analysis_data,
                "llm_response": llm_response,
                "timestamp": timestamp
            }, ensure_ascii=False, indent=2))
        
        # Markdown отчет
        md_path = self.output_dir / f"{base_name}_report_{timestamp}.md"
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(self._create_markdown_report(filename, analysis_data, llm_response))
        
        self.logger.success(f"Результаты сохранены: {json_path}, {md_path}")
        return str(md_path)
    
    def _create_markdown_report(self, filename: str, analysis_data: Dict[str, Any], llm_response: str) -> str:
        """Создание Markdown отчета"""
        overview = analysis_data.get("overview", {})
        
        # Информация о разделителе
        separator_section = ""
        separator_info = overview.get("separator_info", {})
        if separator_info:
            separator_section = f"""
## Информация о парсинге

- **Разделитель:** {separator_info.get("separator_name", "неизвестно")}
- **Ожидаемых столбцов:** {separator_info.get("expected_columns", "неизвестно")}
- **Консистентность:** {separator_info.get("consistency", "неизвестно")}
- **Кодировка:** {separator_info.get("encoding", "неизвестно")}
"""
        
        report = f"""# Анализ данных: {filename}

**Дата анализа:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## Обзор файла

- **Формат:** {overview.get('data_type', 'unknown')}
- **Строк:** {overview.get('rows', 'unknown'):,}
- **Столбцов:** {overview.get('cols', 'unknown')}
- **Размер в памяти:** {overview.get('memory_usage_mb', 0):.2f} MB{separator_section}

## Анализ от LLM

{llm_response}

## Структура данных

```json
{safe_json_dumps(overview, ensure_ascii=False, indent=2)}
```

## Примеры данных

```json
{safe_json_dumps(analysis_data.get('sample', [])[:5], ensure_ascii=False, indent=2)}
```

## Статистика

```json
{safe_json_dumps(analysis_data.get('statistics', {}), ensure_ascii=False, indent=2)}
```
"""
        return report

def create_argument_parser() -> argparse.ArgumentParser:
    """Создание парсера аргументов командной строки"""
    parser = argparse.ArgumentParser(
        description="Анализатор данных с локальной LLM и автоопределением разделителя CSV",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent("""
        Примеры использования:
          %(prog)s                              # анализ первого файла в ./input/
          %(prog)s -i data/ -o results/         # указать папки
          %(prog)s -f myfile.csv                # конкретный файл
          %(prog)s -m llama2 -s 20              # другая модель и больше примеров
          %(prog)s --force-separator ";"        # принудительный разделитель
          %(prog)s -c 27 -v                     # ожидается 27 столбцов, подробный режим
        """)
    )
    
    parser.add_argument("-i", "--input-dir", default=DEFAULT_INPUT_DIR,
                       help=f"Директория с файлами (по умолчанию: {DEFAULT_INPUT_DIR})")
    parser.add_argument("-o", "--output-dir", 
                       help=f"Директория для сохранения результатов (по умолчанию: {DEFAULT_OUTPUT_DIR})")
    parser.add_argument("-f", "--file-pattern",
                       help="Паттерн для поиска файлов (подстрока в имени)")
    parser.add_argument("-m", "--model", default=DEFAULT_MODEL,
                       help=f"Модель Ollama (по умолчанию: {DEFAULT_MODEL})")
    parser.add_argument("-s", "--sample-rows", type=int, default=10,
                       help="Количество примеров строк (по умолчанию: 10)")
    parser.add_argument("-c", "--expected-cols", type=int,
                       help="Ожидаемое количество столбцов (для CSV)")
    parser.add_argument("--force-separator", 
                       help="Принудительный разделитель (например: ';' или '\\t')")
    parser.add_argument("--max-chars", type=int, default=4000,
                       help="Максимум символов для промпта (по умолчанию: 4000)")
    parser.add_argument("--no-save", action="store_true",
                       help="Не сохранять результаты в файлы")
    parser.add_argument("-v", "--verbose", action="store_true",
                       help="Подробный вывод с диагностикой")
    
    return parser

def main():
    """Основная функция"""
    parser = create_argument_parser()
    args = parser.parse_args()
    
    # Конфигурация
    config = AnalysisConfig(
        input_dir=args.input_dir,
        output_dir=args.output_dir or (DEFAULT_OUTPUT_DIR if not args.no_save else None),
        model_name=args.model,
        sample_rows=args.sample_rows,
        max_chars=args.max_chars,
        expected_cols=args.expected_cols,
        file_pattern=args.file_pattern,
        save_results=not args.no_save,
        verbose=args.verbose,
        force_separator=args.force_separator
    )
    
    # Инициализация компонентов
    analyzer = DataAnalyzer(config)
    llm_client = LLMClient(config.model_name, analyzer.logger)
    result_saver = ResultSaver(config.output_dir, analyzer.logger) if config.save_results else None
    
    try:
        # Поиск файлов
        files = analyzer.file_handler.find_files(config.input_dir, config.file_pattern)
        if not files:
            analyzer.logger.error(f"Файлы не найдены в {config.input_dir}")
            sys.exit(1)
        
        analyzer.logger.info(f"Найдено файлов: {len(files)}")
        
        # Берем первый файл для анализа
        file_to_analyze = files[0]
        analyzer.logger.info(f"Анализируем: {file_to_analyze.path}")
        
        # Анализ данных
        analysis_data = analyzer.analyze_file(file_to_analyze)
        
        # LLM анализ
        llm_response = llm_client.analyze_data(
            os.path.basename(file_to_analyze.path), 
            analysis_data
        )
        
        # Вывод результатов
        print("\n" + "="*80)
        print("КРАТКАЯ СВОДКА")
        print("="*80)
        overview = analysis_data.get("overview", {})
        print(f"📊 Файл: {file_to_analyze.path}")
        print(f"📋 Формат: {overview.get('data_type', 'unknown')}")
        print(f"📏 Размер: {overview.get('rows', 0):,} строк × {overview.get('cols', 0)} столбцов")
        print(f"💾 Память: {overview.get('memory_usage_mb', 0):.2f} MB")
        
        # Информация о разделителе
        separator_info = overview.get("separator_info", {})
        if separator_info:
            sep_name = separator_info.get("separator_name", "неизвестно")
            print(f"🔍 Разделитель: {sep_name}")
        
        print("\n" + "="*80)
        print("СТРУКТУРА ДАННЫХ")
        print("="*80)
        print(safe_json_dumps(overview, ensure_ascii=False, indent=2))
        
        print("\n" + "="*80)
        print("АНАЛИЗ LLM")
        print("="*80)
        print(llm_response)
        
        if config.verbose:
            print("\n" + "="*80)
            print("ПОПЫТКИ ЧТЕНИЯ (первые 5)")
            print("="*80)
            attempts = overview.get("read_attempts", [])
            for i, (cfg, status) in enumerate(attempts[:5], 1):
                print(f"{i:02d}. {cfg} -> {status}")
            
            print("\n" + "="*80) 
            print("ПРИМЕРЫ ДАННЫХ (первые 3 записи)")
            print("="*80)
            sample = analysis_data.get("sample", [])
            print(safe_json_dumps(sample[:3], ensure_ascii=False, indent=2))
        
        # Сохранение результатов
        if result_saver:
            report_path = result_saver.save_analysis(
                file_to_analyze.path,
                analysis_data, 
                llm_response
            )
            print(f"\n📄 Полный отчет сохранен: {report_path}")
        
        analyzer.logger.success("Анализ завершен успешно!")
        
    except KeyboardInterrupt:
        analyzer.logger.warning("Прервано пользователем")
        sys.exit(1)
    except Exception as e:
        analyzer.logger.error(f"Критическая ошибка: {e}")
        if config.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
