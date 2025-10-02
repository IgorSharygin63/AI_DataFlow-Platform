import asyncio
import os
import logging
import sys
import traceback
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.tools import load_mcp_tools
from langgraph.prebuilt import create_react_agent
from langchain_ollama import ChatOllama

# Базовое логирование
logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('mcp_debug.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

class ServerManager:
    def __init__(self):
        self.server_processes = {}
        
    def cleanup(self):
        """Очистка процессов серверов"""
        for name, process in self.server_processes.items():
            try:
                if process.poll() is None:
                    process.terminate()
                    process.wait(timeout=5)
            except Exception as e:
                try:
                    process.kill()
                except:
                    pass

async def load_tools_from_client(client: MultiServerMCPClient, server_name: str) -> list:
    """Загрузка инструментов с использованием нового API"""
    try:
        async with client.session(server_name) as session:
            tools = await load_mcp_tools(session)
            return tools
    except Exception as e:
        logger.error(f"Ошибка при загрузке инструментов для '{server_name}': {e}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        return []

async def main():
    server_manager = ServerManager()
    client = None
    
    try:
        # Пути к серверам
        server_paths = {
            "search": r"E:\agent_mcp-main\mcp_server\search_sever_duckduck_go.py",
            "db_sever": r"E:\agent_mcp-main\sqlite_explorer_v2.py"
        }
        
        # Используем серверы без тестирования
        working_servers = server_paths
        
        print(f"✅ Серверы готовы к работе: {list(working_servers.keys())}")
        
        # Инициализация модели
        try:
            model = ChatOllama(model="qwen3:30b")
        except Exception as e:
            print(f"❌ ОШИБКА: Не удалось инициализировать модель: {e}")
            return
        
        # Конфигурация серверов для MCP клиента
        project_root = r"E:\agent_mcp-main"
        server_configs = {}
        
        for server_name, server_path in working_servers.items():
            server_configs[server_name] = {
                "command": "python",
                "args": [server_path],
                "transport": "stdio",
                "env": {"PYTHONPATH": project_root}
            }
        
        # Создание MCP клиента
        try:
            client = MultiServerMCPClient(server_configs)
            
            # Получение инструментов
            try:
                all_tools = await client.get_tools()
                
                if not all_tools:
                    # Альтернативный способ - загружаем через сессии
                    all_tools = []
                    for server_name in working_servers.keys():
                        tools = await load_tools_from_client(client, server_name)
                        all_tools.extend(tools)
                        
            except Exception as e:
                # Пробуем альтернативный способ
                all_tools = []
                for server_name in working_servers.keys():
                    tools = await load_tools_from_client(client, server_name)
                    all_tools.extend(tools)
            
            if not all_tools:
                print("❌ ОШИБКА: Не получено ни одного рабочего инструмента")
                return
            
            print(f"✅ Загружено инструментов: {len(all_tools)}")
            
            # Создаем агента
            try:
                agent = create_react_agent(model, all_tools)
            except Exception as e:
                print(f"❌ ОШИБКА при создании агента: {e}")
                return

            print("\n" + "="*70)
            print("🚀 ИНТЕРАКТИВНЫЙ ЧАТ УСПЕШНО ЗАПУЩЕН!")
            print(f"📊 Активные серверы: {', '.join(working_servers.keys())}")
            print(f"🛠️ Доступно инструментов: {len(all_tools)}")
            print("💡 Команды: 'exit', 'quit', 'выход' - для завершения")
            print("💡 'tools' - показать доступные инструменты")
            print("="*70)

            # Основной цикл чата
            while True:
                try:
                    user_input = input("\n🤔 Вы: ").strip()
                    
                    if user_input.lower() in {"exit", "quit", "выход"}:
                        print("👋 Выход из чата.")
                        break
                    
                    if user_input.lower() == "tools":
                        print("\n🛠️ Доступные инструменты:")
                        for i, tool in enumerate(all_tools, 1):
                            tool_name = getattr(tool, 'name', 'Неизвестно')
                            print(f"{i}. {tool_name}")
                        continue
                    
                    if not user_input:
                        continue
                    
                    print("🤖 Агент обрабатывает запрос...")
                    res = await agent.ainvoke({"messages": user_input})
                    
                    print("\n🤖 Ответ агента:")
                    if 'messages' in res:
                        for i, m in enumerate(res['messages']):
                            if hasattr(m, 'content') and m.content:
                                print(f"  {m.content}")
                                if i < len(res['messages']) - 1:
                                    print("-" * 30)
                    else:
                        print("⚠️ Получен ответ в неожиданном формате")
                        print(f"Ответ: {res}")
                        
                except KeyboardInterrupt:
                    print("\n\n⏹️ Прерывание по Ctrl+C")
                    break
                except Exception as e:
                    print(f"⚠️ Ошибка: {e}")

        except Exception as e:
            print(f"❌ ОШИБКА MCP клиента: {e}")

    except Exception as e:
        print(f"❌ ОБЩАЯ ОШИБКА: {e}")
    
    finally:
        # Очистка ресурсов
        if client:
            try:
                if hasattr(client, 'close'):
                    await client.close()
                elif hasattr(client, 'disconnect'):
                    await client.disconnect()
            except Exception:
                pass
        
        server_manager.cleanup()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⏹️ Программа прервана пользователем")
    except Exception as e:
        print(f"❌ КРИТИЧЕСКАЯ ОШИБКА: {e}")