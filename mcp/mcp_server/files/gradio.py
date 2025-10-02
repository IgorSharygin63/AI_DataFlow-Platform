

import asyncio
import os
import logging
import sys
import traceback
import subprocess
import time
import signal
import atexit
from typing import Dict, Any, List, Tuple

import gradio as gr
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.tools import load_mcp_tools # Used if client.get_tools() fails
from langgraph.prebuilt import create_react_agent
from langchain_ollama import ChatOllama

# --- Глобальные переменные для хранения состояния ---
agent = None
server_manager_global = None
client_global = None
all_tools_global = None
model_global = None
INITIALIZATION_SUCCESS = False

# --- Настройка логирования (такая же, как в предыдущем скрипте) ---
logging.basicConfig(
    level=logging.INFO, # Установим INFO, DEBUG слишком многословен для Gradio UI
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('mcp_gradio_debug.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

def debug_print(message):
    """Функция для отладочного вывода в лог"""
    logger.debug(message)

# --- Класс ServerManager (скопирован из предыдущего скрипта) ---
class ServerManager:
    def __init__(self):
        self.server_processes = {}
        
    async def test_server_standalone(self, server_path: str, server_name: str) -> bool:
        debug_print(f"Тестируем сервер {server_name} по пути: {server_path}")
        try:
            if not os.path.exists(server_path):
                debug_print(f"❌ Файл сервера не найден: {server_path}")
                return False
            debug_print(f"✅ Файл сервера найден: {server_path}")
            
            process = subprocess.Popen(
                [sys.executable, server_path],
                stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                text=True, cwd=os.path.dirname(server_path),
                creationflags=subprocess.CREATE_NO_WINDOW # Для Windows, чтобы не открывалось консольное окно
            )
            await asyncio.sleep(2) # Время на запуск
            
            if process.poll() is None:
                debug_print(f"✅ Сервер {server_name} запустился (PID: {process.pid})")
                try:
                    process.stdin.write('{"jsonrpc": "2.0", "method": "initialize", "id": 1}\n')
                    process.stdin.flush()
                    await asyncio.sleep(1)
                    process.terminate()
                    try:
                        process.wait(timeout=2)
                    except subprocess.TimeoutExpired:
                        process.kill()
                    debug_print(f"✅ Сервер {server_name} прошел тест")
                    return True
                except Exception as e:
                    debug_print(f"⚠️ Ошибка при тестировании {server_name}: {e}")
                    process.terminate()
                    try:
                        process.wait(timeout=2)
                    except subprocess.TimeoutExpired:
                        process.kill()
                    return False
            else:
                stdout, stderr = process.communicate()
                debug_print(f"❌ Сервер {server_name} завершился. STDOUT: {stdout}. STDERR: {stderr}")
                return False
        except Exception as e:
            debug_print(f"❌ Исключение при тестировании сервера {server_name}: {e}\n{traceback.format_exc()}")
            return False
    
    def cleanup(self):
        debug_print("Завершаем процессы серверов (если они были запущены ServerManager)...")
        # Эта реализация ServerManager не запускает серверы для MCPClient,
        # MCPClient делает это сам. Эта функция здесь для совместимости, если бы SM управлял процессами.
        # В данном контексте MCPClient управляет дочерними процессами.
        # Поэтому основной фокус cleanup будет на закрытии MCPClient.
        pass


# --- Функция для загрузки инструментов через сессии (альтернативный метод) ---
async def load_tools_from_client_sessions(client: MultiServerMCPClient, server_name: str) -> list:
    debug_print(f"Загружаем инструменты для сервера '{server_name}' через сессии")
    try:
        async with client.session(server_name) as session:
            tools = await load_mcp_tools(session)
            debug_print(f"Загружено {len(tools)} инструментов для '{server_name}'")
            return tools
    except Exception as e:
        debug_print(f"❌ Ошибка при загрузке инструментов для '{server_name}' через сессии: {e}\n{traceback.format_exc()}")
        return []

# --- Инициализация ресурсов агента ---
async def initialize_agent_resources():
    global agent, server_manager_global, client_global, all_tools_global, model_global, INITIALIZATION_SUCCESS
    
    if INITIALIZATION_SUCCESS:
        return True

    logger.info("=== ЗАПУСК ИНИЦИАЛИЗАЦИИ РЕСУРСОВ АГЕНТА ===")
    server_manager_global = ServerManager()
    
    try:
        server_paths = {
            "search": r"E:\agent_mcp-main\mcp_server\search_sever_duckduck_go.py",
            "files": r"E:\agent_mcp-main\mcp_server\server_2.py"
        }
        
        logger.info("Тестирование серверов...")
        working_servers = {}
        for server_name, server_path in server_paths.items():
            if await server_manager_global.test_server_standalone(server_path, server_name):
                working_servers[server_name] = server_path
                logger.info(f"Сервер {server_name} прошел тест.")
            else:
                logger.warning(f"Сервер {server_name} не прошел тест.")
        
        if not working_servers:
            logger.error("Ни один сервер не прошел тестирование. Инициализация прервана.")
            return False

        logger.info(f"Рабочие серверы: {list(working_servers.keys())}")

        logger.info("Инициализация модели ChatOllama...")
        model_global = ChatOllama(model="qwen3:1.7b")
        logger.info("Модель ChatOllama инициализирована.")

        project_root = r"E:\agent_mcp-main"
        server_configs = {
            name: {"command": sys.executable, "args": [path], "transport": "stdio", "env": {"PYTHONPATH": project_root}}
            for name, path in working_servers.items()
        }
        
        logger.info(f"Конфигурация MCP серверов: {server_configs}")
        
        logger.info("Создание MCP клиента...")
        client_global = MultiServerMCPClient(server_configs)
        logger.info("MCP клиент создан.")
        
        logger.info("Ожидание инициализации серверов клиентом (5 секунд)...")
        await asyncio.sleep(5)

        logger.info("Загрузка инструментов...")
        try:
            all_tools_global = await client_global.get_tools()
            logger.info(f"Успешно загружено {len(all_tools_global)} инструментов через client.get_tools().")
        except Exception as e:
            logger.warning(f"Ошибка при вызове client.get_tools(): {e}. Пробуем загрузить через сессии...")
            all_tools_global = []
            for server_name_key in working_servers.keys():
                tools_session = await load_tools_from_client_sessions(client_global, server_name_key)
                all_tools_global.extend(tools_session)
            logger.info(f"Загружено {len(all_tools_global)} инструментов через сессии.")

        if not all_tools_global:
            logger.error("Не удалось загрузить инструменты. Инициализация прервана.")
            await cleanup_resources() # Попытка очистить уже созданный клиент
            return False
        
        tool_names = [getattr(t, 'name', str(type(t))) for t in all_tools_global]
        logger.info(f"Загруженные инструменты: {tool_names}")

        logger.info("Создание ReAct агента...")
        agent = create_react_agent(model_global, all_tools_global)
        logger.info("ReAct агент успешно создан.")
        
        INITIALIZATION_SUCCESS = True
        logger.info("=== ИНИЦИАЛИЗАЦИЯ РЕСУРСОВ АГЕНТА ЗАВЕРШЕНА УСПЕШНО ===")
        return True

    except Exception as e:
        logger.error(f"Критическая ошибка во время инициализации: {e}\n{traceback.format_exc()}")
        await cleanup_resources() # Попытка очистить ресурсы при ошибке
        return False

# --- Функция взаимодействия с чатом ---
async def chat_interaction(message: str, history: List[Tuple[str, str]]):
    global agent
    
    if not INITIALIZATION_SUCCESS or agent is None:
        logger.error("Агент не инициализирован. Попытка инициализации...")
        if not await initialize_agent_resources(): # Попытка инициализировать снова
             history.append((message, "Ошибка: Агент не смог инициализироваться. Проверьте логи."))
             return "", history
        if agent is None: # Если все еще None после попытки
             history.append((message, "Критическая ошибка: Агент не доступен после инициализации."))
             return "", history

    logger.info(f"Пользователь: {message}")
    
    try:
        # Для langgraph ReAct агента, вход должен быть словарем с ключом "messages"
        # и значением - строкой последнего сообщения пользователя.
        # Однако, для поддержания контекста, лучше передавать историю сообщений.
        # Сохраним простой вариант для начала: только последнее сообщение.
        # Для полноценного контекста нужно адаптировать `create_react_agent` или его использование.
        
        # Собираем историю для агента
        agent_messages = []
        for user_msg, ai_msg in history:
            if user_msg: # Добавляем предыдущее сообщение пользователя
                 agent_messages.append({"role": "user", "content": user_msg})
            if ai_msg and "Ошибка:" not in ai_msg : # Добавляем предыдущий ответ ИИ, если это не ошибка
                 agent_messages.append({"role": "assistant", "content": ai_msg})
        agent_messages.append({"role": "user", "content": message})


        # res = await agent.ainvoke({"messages": message}) # Передаем только последнее сообщение
        # Передаем историю сообщений, если агент это поддерживает (langgraph агенты обычно да)
        # Структура 'messages' для langgraph может требовать список объектов Message
        # В данном случае, create_react_agent ожидает {"messages": [("user", message)]} или похожую структуру
        # Исходя из логов предыдущего скрипта, агент принимал {"messages": user_input}
        # где user_input - это строка. Попробуем так, но для истории это не идеально.
        # Если агент поддерживает историю, формат будет {"messages": [HumanMessage(...), AIMessage(...)]}
        
        # Простой вариант: передаем только последнее сообщение.
        # Для полной истории, нужно будет адаптировать формат.
        # res = await agent.ainvoke({"messages": message})
        
        # Более сложный вариант с попыткой передать историю (формат может потребовать корректировки):
        from langchain_core.messages import HumanMessage, AIMessage
        formatted_messages = []
        for h_msg, a_msg in history: # h_msg - это предыдущий user_input, a_msg - предыдущий AI output
            if h_msg: formatted_messages.append(HumanMessage(content=h_msg))
            if a_msg and "Ошибка:" not in a_msg: formatted_messages.append(AIMessage(content=a_msg))
        formatted_messages.append(HumanMessage(content=message))

        res = await agent.ainvoke({"messages": formatted_messages})
        
        logger.info(f"Ответ агента (сырой): {res}")

        # Извлекаем последнее сообщение от AI
        if res and 'messages' in res and isinstance(res['messages'], list) and len(res['messages']) > 0:
            # Ищем последнее AIMessage, оно обычно содержит финальный ответ
            final_ai_message = None
            for m in reversed(res['messages']):
                if hasattr(m, 'type') and m.type == 'ai' and hasattr(m, 'content'):
                    final_ai_message = m.content
                    break
            
            if final_ai_message:
                bot_response = final_ai_message
            else: # Если не нашли AIMessage, берем контент последнего сообщения
                last_message_obj = res['messages'][-1]
                bot_response = getattr(last_message_obj, 'content', str(last_message_obj))

        else:
            bot_response = "Получен неожиданный формат ответа от агента."
        
        logger.info(f"Агент: {bot_response}")
        history.append((message, bot_response))
        
    except Exception as e:
        logger.error(f"Ошибка во время взаимодействия с агентом: {e}\n{traceback.format_exc()}")
        bot_response = f"Произошла ошибка: {str(e)}"
        history.append((message, bot_response))
        
    return "", history # Очищаем поле ввода, возвращаем обновленную историю

# --- Функция очистки ресурсов ---
async def cleanup_resources():
    global client_global, server_manager_global
    logger.info("=== НАЧАЛО ОЧИСТКИ РЕСУРСОВ ===")
    
    if client_global:
        try:
            logger.info("Закрытие MCP клиента...")
            # MCPClient не имеет явного метода close/disconnect в этой версии,
            # он управляет дочерними процессами и должен завершать их при выходе из контекста
            # или при удалении объекта. Поскольку мы не используем context manager,
            # процессы должны завершаться при завершении основного скрипта.
            # Принудительное закрытие может быть сложным без метода `close()`.
            # Однако, если `MultiServerMCPClient` запускает процессы, они должны быть его детьми
            # и могут завершиться при выходе.
            # Попробуем вызвать __aexit__ если он есть, хотя это не стандартно.
            if hasattr(client_global, "__aexit__"):
                 await client_global.__aexit__(None,None,None)
                 logger.info("MCP клиент (через __aexit__) попытался закрыться.")
            else:
                 logger.info("MCP клиент не имеет явного метода close. Дочерние процессы должны завершиться с основным процессом.")
            client_global = None
        except Exception as e:
            logger.warning(f"Ошибка при попытке закрыть MCP клиент: {e}")
            
    if server_manager_global:
        try:
            server_manager_global.cleanup() # Этот метод в ServerManager сейчас пуст
            logger.info("ServerManager cleanup вызван.")
        except Exception as e:
            logger.warning(f"Ошибка при вызове ServerManager.cleanup: {e}")
    
    logger.info("=== ОЧИСТКА РЕСУРСОВ ЗАВЕРШЕНА ===")

def on_shutdown():
    """Синхронная обертка для asyncio.run(cleanup_resources())"""
    logger.info("Gradio приложение завершает работу. Запускаем очистку ресурсов...")
    try:
        asyncio.run(cleanup_resources())
    except RuntimeError as e:
        # Это может произойти, если цикл asyncio уже остановлен или не существует
        logger.warning(f"Ошибка при запуске cleanup_resources в on_shutdown (RuntimeError): {e}. Возможно, цикл уже закрыт.")
        # Попытаемся запустить в новом цикле, если это поможет
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(cleanup_resources())
        finally:
            loop.close()
    except Exception as e:
        logger.error(f"Непредвиденная ошибка в on_shutdown: {e}\n{traceback.format_exc()}")


# --- Запуск Gradio интерфейса ---
if __name__ == "__main__":
    # Регистрируем функцию очистки при выходе
    atexit.register(on_shutdown)

    # Попытка инициализировать ресурсы перед запуском Gradio
    logger.info("Запуск предварительной инициализации ресурсов...")
    init_success = asyncio.run(initialize_agent_resources())
    
    if not init_success:
        logger.error("Критическая ошибка: не удалось инициализировать ресурсы агента. Приложение Gradio не будет полностью функционально.")
        # Можно решить не запускать Gradio или запустить с сообщением об ошибке
        # Для демонстрации запустим, но чат будет сообщать об ошибке инициализации.

    with gr.Blocks(theme=gr.themes.Soft()) as demo:
        gr.Markdown("# MCP Агент с Графическим Интерфейсом")
        gr.Markdown(
            "Введите ваш запрос к агенту. Агент использует поисковый сервер и файловый сервер для выполнения задач."
            f"\n\n**Статус инициализации:** {'Успешно' if INITIALIZATION_SUCCESS else 'Ошибка (проверьте mcp_gradio_debug.log)'}"
        )
        
        chatbot = gr.Chatbot(label="Диалог с агентом", height=600)
        msg = gr.Textbox(label="Ваш запрос", placeholder="Пример: какая погода в Лондоне и запиши ее в файл london_weather.txt")
        clear = gr.Button("Очистить диалог")

        msg.submit(chat_interaction, [msg, chatbot], [msg, chatbot])
        clear.click(lambda: None, None, chatbot, queue=False)

    logger.info("Запуск Gradio интерфейса...")
    # Для предотвращения зависания Ctrl+C в Windows с asyncio + Gradio:
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
    demo.queue().launch(share=True, server_name="0.0.0.0") # share=True для доступа извне
    
    # После demo.launch() программа будет работать до закрытия Gradio.
    # функция on_shutdown, зарегистрированная через atexit, будет вызвана при завершении.
    logger.info("Gradio интерфейс запущен.")


