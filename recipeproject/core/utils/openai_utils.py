import openai

client = openai.OpenAI(api_key='OPENAI_KEY')

def get_ingredient_alternatives_llm(ingredient, recipe_title):
    prompt = f"""
You are an expert Turkish cuisine chef assistant.
You will be given a Turkish recipe title and a *missing ingredient*.
Based on real Turkish culinary practice:

- If the missing ingredient is a type of **red meat** (like beef, lamb, mutton, veal), ONLY suggest other red meats as alternatives (e.g., beef, lamb, or veal). DO NOT suggest poultry, fish, or plant-based proteins for red meat.
- If the missing ingredient is a **poultry** (chicken, turkey, duck), ONLY suggest other poultry. DO NOT suggest red meat or fish.
- If the missing ingredient is a **fish or seafood**, ONLY suggest another fish or seafood. DO NOT suggest any kind of meat or poultry.
- For common ingredients like **butter, oil, milk, flour, eggs**, suggest practical Turkish kitchen alternatives if they exist (e.g., butter ↔ margarine ↔ olive oil).
- If the missing ingredient does not have a real, widely-accepted substitute in Turkish cuisine for this specific recipe, reply exactly: No suitable alternative exists.

Recipe title: {recipe_title}
Missing ingredient: {ingredient}

List suitable alternatives (max 3, comma-separated). If none, reply 'No suitable alternative exists.' Only return the alternatives, no extra explanation or bullet points.
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an expert Turkish chef assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=60,
        temperature=0.4,
    )
    return response.choices[0].message.content.strip()
