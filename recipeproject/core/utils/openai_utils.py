import openai

client = openai.OpenAI(api_key='')

def get_ingredient_alternatives_llm(ingredient, recipe_title):
    prompt = f"""
You are a world-class Turkish cuisine chef assistant.
You will be given a Turkish recipe title and a *missing ingredient*.
If and only if there is a real, widely-accepted substitute in Turkish cooking for this ingredient **in this specific recipe**, list it/them (max 3, comma-separated). 
If there is no suitable alternative in practice, reply exactly: No suitable alternative exists.

Recipe title: {recipe_title}
Missing ingredient: {ingredient}

List suitable alternatives (max 3, comma-separated). If none, reply 'No suitable alternative exists.' Only return the alternatives, no extra explanation or bullet points.
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a strict Turkish chef assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=60,
        temperature=0.2,
    )
    return response.choices[0].message.content.strip()

