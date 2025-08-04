from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA


def build_qa_chain(vectordb):
    llm = OllamaLLM(model="llama3", temperature=0.2)

#     prompt = PromptTemplate.from_template("""
# You are an intelligent assistant that answers questions strictly based on the given website content.
#
# Your job is to analyze the provided context, which has been extracted from a specific web page or from the existing
# vector db.
#
# Rules:
# - Only use the content provided in the context below.
# - Do not use any prior knowledge, assumptions, or external data.
# - If the answer is not explicitly mentioned in the context, reply exactly with:
# "I cannot answer based on the given content."
#
# Use three sentence maximum and keep the answer concise.
#
#
# Context:
# {context}
#
# Question: {question}
# Answer:[Your answer here]
# """)
    prompt_template = """
    You are an intelligent assistant that answers questions strictly based on the given website content.

    Your job is to analyze the provided context, which has been extracted from a specific web page or from the existing 
    vector db.

    Rules:
    - Only use the content provided in the context below.
    - Do not use any prior knowledge, assumptions, or external data.
    - If the answer is not explicitly mentioned in the context, reply exactly with:
    "I cannot answer based on the given content."

    Use three sentence maximum and keep the answer concise.

    
    Context:
    {context}

    Question: {question}
    Answer:[Your answer here]
    """

    PROMPT = PromptTemplate(
        template=prompt_template,
        input_variables=["context", "question"]
        # input_variables=["context", "question", "intent"]
    )
    retrieval_qa = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=vectordb.as_retriever(),
        chain_type_kwargs={"prompt": PROMPT},
        verbose=True,
    )
    return retrieval_qa
