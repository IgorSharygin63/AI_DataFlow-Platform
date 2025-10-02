import os
import sys
import logging
from contextlib import closing
from pathlib import Path

from mcp.server import InitializationOptions
from mcp.server.lowlevel import Server, NotificationOptions
from mcp.server.stdio import stdio_server
import mcp.types as types

# Настройка кодировки для Windows
if sys.platform == "win32" and os.environ.get('PYTHONIOENCODING') is None:
    sys.stdin.reconfigure(encoding="utf-8")
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

logger = logging.getLogger('mcp_file_tools')
logger.info("Starting MCP File Tools Server")

# Базовая директория для файлов
BASE_DIR = os.path.join(os.path.dirname(__file__), "files")

# Создаем базовую директорию если её нет
os.makedirs(BASE_DIR, exist_ok=True)

class FileTools:
    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        
    def create_folder(self, folder_name: str) -> str:
        """Создаёт папку с указанным именем в базовой директории."""
        folder_path = os.path.join(self.base_dir, folder_name)
        try:
            os.makedirs(folder_path, exist_ok=True)
            return f"Папка '{folder_name}' успешно создана в {folder_path}"
        except Exception as e:
            return f"Ошибка при создании папки: {e}"

    def create_text_file(self, file_name: str, content: str) -> str:
        """Создаёт текстовый файл с указанным именем и содержимым в базовой директории."""
        file_path = os.path.join(self.base_dir, file_name)
        try:
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)
            return f"Файл '{file_name}' успешно создан в {file_path}"
        except Exception as e:
            return f"Ошибка при создании файла: {e}"

    def read_text_file(self, file_name: str) -> str:
        """Читает содержимое текстового файла."""
        file_path = os.path.join(self.base_dir, file_name)
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            return f"Содержимое файла '{file_name}':\n{content}"
        except FileNotFoundError:
            return f"Файл '{file_name}' не найден"
        except Exception as e:
            return f"Ошибка при чтении файла: {e}"

    def list_files(self) -> str:
        """Показывает список всех файлов и папок в базовой директории."""
        try:
            items = os.listdir(self.base_dir)
            if not items:
                return "Директория пуста"
            
            files = []
            folders = []
            for item in items:
                item_path = os.path.join(self.base_dir, item)
                if os.path.isfile(item_path):
                    files.append(f"📄 {item}")
                else:
                    folders.append(f"📁 {item}")
            
            result = f"Содержимое директории {self.base_dir}:\n"
            if folders:
                result += "Папки:\n" + "\n".join(folders) + "\n"
            if files:
                result += "Файлы:\n" + "\n".join(files)
            
            return result
        except Exception as e:
            return f"Ошибка при получении списка файлов: {e}"

    def delete_file(self, file_name: str) -> str:
        """Удаляет файл из базовой директории."""
        file_path = os.path.join(self.base_dir, file_name)
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

async def main(base_dir: str):
    logger.info(f"Starting File Tools MCP Server with base dir: {base_dir}")

    file_tools = FileTools(base_dir)
    server = Server("file-tools")

    # Регистрируем обработчики
    logger.debug("Регистрация обработчиков")

    @server.list_tools()
    async def handle_list_tools() -> list[types.Tool]:
        """Список доступных инструментов"""
        return [
            types.Tool(
                name="create_folder",
                description="Создаёт папку с указанным именем в базовой директории",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "folder_name": {"type": "string", "description": "Имя создаваемой папки"},
                    },
                    "required": ["folder_name"],
                },
            ),
            types.Tool(
                name="create_text_file",
                description="Создаёт текстовый файл с указанным именем и содержимым",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "file_name": {"type": "string", "description": "Имя создаваемого файла"},
                        "content": {"type": "string", "description": "Содержимое файла"},
                    },
                    "required": ["file_name", "content"],
                },
            ),
            types.Tool(
                name="read_text_file",
                description="Читает содержимое текстового файла",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "file_name": {"type": "string", "description": "Имя файла для чтения"},
                    },
                    "required": ["file_name"],
                },
            ),
            types.Tool(
                name="list_files",
                description="Показывает список всех файлов и папок в базовой директории",
                inputSchema={
                    "type": "object",
                    "properties": {},
                },
            ),
            types.Tool(
                name="delete_file",
                description="Удаляет файл из базовой директории",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "file_name": {"type": "string", "description": "Имя файла для удаления"},
                    },
                    "required": ["file_name"],
                },
            ),
        ]

    @server.call_tool()
    async def handle_call_tool(
        name: str, arguments: dict[str, str] | None
    ) -> list[types.TextContent]:
        """Обработка запросов на выполнение инструментов"""
        try:
            if not arguments:
                arguments = {}
                
            if name == "create_folder":
                if "folder_name" not in arguments:
                    raise ValueError("Отсутствует аргумент folder_name")
                result = file_tools.create_folder(arguments["folder_name"])
                return [types.TextContent(type="text", text=result)]
                
            elif name == "create_text_file":
                if "file_name" not in arguments or "content" not in arguments:
                    raise ValueError("Отсутствуют обязательные аргументы")
                result = file_tools.create_text_file(arguments["file_name"], arguments["content"])
                return [types.TextContent(type="text", text=result)]
                
            elif name == "read_text_file":
                if "file_name" not in arguments:
                    raise ValueError("Отсутствует аргумент file_name")
                result = file_tools.read_text_file(arguments["file_name"])
                return [types.TextContent(type="text", text=result)]
                
            elif name == "list_files":
                result = file_tools.list_files()
                return [types.TextContent(type="text", text=result)]
                
            elif name == "delete_file":
                if "file_name" not in arguments:
                    raise ValueError("Отсутствует аргумент file_name")
                result = file_tools.delete_file(arguments["file_name"])
                return [types.TextContent(type="text", text=result)]
                
            else:
                raise ValueError(f"Неизвестный инструмент: {name}")
                
        except Exception as e:
            return [types.TextContent(type="text", text=f"Ошибка: {str(e)}")]

    async with stdio_server() as (read_stream, write_stream):
        logger.info("Сервер запущен с транспортом stdio")
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="file-tools",
                server_version="0.1.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )

class ServerWrapper():
    """Обертка для совместимости с mcp[cli]"""
    def run(self):
        import asyncio
        asyncio.run(main(BASE_DIR))

wrapper = ServerWrapper()

if __name__ == "__main__":
    print(f"Запуск файлового сервера. Базовая директория: {BASE_DIR}")
    wrapper.run()