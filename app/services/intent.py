from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.chains import LLMChain

INTENT_CLASSIFIER_PROMPT = """
You are an intent classifier for chatbot queries.

Possible intents:
- hiring
- product_info
- contact
- general_query

Classify the question strictly as one of the above intents.

Only output the intent. Do not include any explanation.

Question: {question}
Intent:
"""


def detect_intent(question: str) -> str:
    llm = OllamaLLM(model="llama3", temperature=0)
    prompt = PromptTemplate.from_template(INTENT_CLASSIFIER_PROMPT)
    output_parser = StrOutputParser()
    intent_chain = prompt | llm | output_parser
    raw_output = intent_chain.invoke({"question": question})
    print(raw_output)
    return raw_output.strip().lower()
