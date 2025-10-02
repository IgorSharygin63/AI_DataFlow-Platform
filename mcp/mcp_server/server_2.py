

import os
from mcp.server.fastmcp import FastMCP

# Создаем MCP сервер
mcp = FastMCP("FileTools")

# Базовая директория для файлов (вместо CFG.BASE_DIR)
BASE_DIR = os.path.join(os.path.dirname(__file__), "files")

# Создаем базовую директорию если её нет
os.makedirs(BASE_DIR, exist_ok=True)



@mcp.tool()
def create_folder(folder_name: str) -> str:
    """Создаёт папку с указанным именем в базовой директории."""
    folder_path = os.path.join(BASE_DIR, folder_name)
    try:
        os.makedirs(folder_path, exist_ok=True)
        return f"Папка '{folder_name}' успешно создана в {folder_path}"
    except Exception as e:
        return f"Ошибка при создании папки: {e}"

@mcp.tool()
def create_text_file(file_name: str, content: str) -> str:
    """Создаёт текстовый файл с указанным именем и содержимым в базовой директории."""
    file_path = os.path.join(BASE_DIR, file_name)
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        return f"Файл '{file_name}' успешно создан в {file_path}"
    except Exception as e:
        return f"Ошибка при создании файла: {e}"

@mcp.tool()
def read_text_file(file_name: str) -> str:
    """Читает содержимое текстового файла."""
    file_path = os.path.join(BASE_DIR, file_name)
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        return f"Содержимое файла '{file_name}':\n{content}"
    except FileNotFoundError:
        return f"Файл '{file_name}' не найден"
    except Exception as e:
        return f"Ошибка при чтении файла: {e}"

@mcp.tool()
def list_files() -> str:
    """Показывает список всех файлов и папок в базовой директории."""
    try:
        items = os.listdir(BASE_DIR)
        if not items:
            return "Директория пуста"
        
        files = []
        folders = []
        for item in items:
            item_path = os.path.join(BASE_DIR, item)
            if os.path.isfile(item_path):
                files.append(f"📄 {item}")
            else:
                folders.append(f"📁 {item}")
        
        result = f"Содержимое директории {BASE_DIR}:\n"
        if folders:
            result += "Папки:\n" + "\n".join(folders) + "\n"
        if files:
            result += "Файлы:\n" + "\n".join(files)
        
        return result
    except Exception as e:
        return f"Ошибка при получении списка файлов: {e}"

@mcp.tool()
def delete_file(file_name: str) -> str:
    """Удаляет файл из базовой директории."""
    file_path = os.path.join(BASE_DIR, file_name)
    try:
        if os.path.exists(file_path):
            if os.path.isfile(file_path):
                os.remove(file_path)
                return f"Файл '{file_name}' успешно удален"
            else:
                return f"'{file_name}' является папкой, не файлом"
        else:
            return f"Файл '{file_name}' не найден"
    except Exception as e:
        return f"Ошибка при удалении файла: {e}"

if __name__ == "__main__":
    print(f"Запуск файлового сервера. Базовая директория: {BASE_DIR}")
    mcp.run(transport="stdio")

