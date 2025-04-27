# 📚 SmartChef API Documentation

## 🛡️ User Endpoints
- **POST /api/register/** → User Registration  
- **POST /api/login/** → User Login  
- **GET /api/profile/** → Get User Profile

## 🥘 Recipe Endpoints
- **GET /api/recipes/** → List or Filter Recipes (`?title=`, `?prep_time=`, `?ordering=`)
- **POST /api/recipes/** → Create New Recipe
- **GET /api/recipes/{id}/** → Get Recipe Details
- **PUT /api/recipes/{id}/** → Update Recipe (Partial Update Supported)
- **DELETE /api/recipes/{id}/** → Delete Recipe

## 🧂 Ingredient Endpoints
- **GET /api/ingredients/** → List Ingredients
- **POST /api/ingredients/** → Add New Ingredient

## 🔍 Smart Search and Recommendations
- **POST /api/recipes/by-ingredients/** → Find Recipes by Ingredients
- **GET /api/seasonal-ingredients/** → Seasonal Ingredient Suggestions

---

## 📬 Example Requests and Responses

### ➡️ Register
**POST /api/register/**  
```json
{
  "name": "deneme",
  "email": "deneme@gmail.com",
  "password": "123456",
}
```

### ➡️ Login
**POST /api/login/**  
```json
{
  "email": "deneme@gmail.com",
  "password": "123456"
}
```

### ➡️ Create Recipe
**POST /api/recipes/**  
```json
{
  "title": "Banana Pancake",
  "description": "Simple banana pancake",
  "instructions": "Mix and cook.",
  "prep_time": 10,
  "cook_time": 5,
  "servings": 2,
  "ingredients": [
    {
      "ingredient": 1,
      "amount": 2,
      "unit": "pieces"
    }
  ]
}
```

### ➡️ Search Recipes by Ingredients
**POST /api/recipes/by-ingredients/**  
```json
{
  "ingredients": ["flour", "milk"],
  "title": "pancake",
  "alpha": 0.5
}
```

### ➡️ Get Seasonal Ingredients
**GET /api/seasonal-ingredients/**  
```json
{
  "season": "summer",
  "ingredients": ["tomato", "zucchini", "peach"]
}
```

---

## 📜 Status Codes
- `200 OK` → Successful Request
- `201 Created` → Successfully Created
- `204 No Content` → Successfully Deleted
- `400 Bad Request` → Validation or Request Error
- `401 Unauthorized` → Authentication Required
- `403 Forbidden` → Permission Denied
- `404 Not Found` → Resource Not Found
