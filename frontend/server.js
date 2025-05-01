import express from 'express';
import fs from 'fs';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Charger les données depuis db.json
const loadData = () => {
  try {
    const data = fs.readFileSync('./db.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    return { users: [], recipes: [], favorites: [] };
  }
};

// Sauvegarder les données dans db.json
const saveData = (data) => {
  try {
    fs.writeFileSync('./db.json', JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données:', error);
  }
};

// Routes d'authentification
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const data = loadData();
  
  const user = data.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Ne pas renvoyer le mot de passe
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.status(401).json({ message: 'Email ou mot de passe incorrect' });
  }
});

app.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;
  const data = loadData();
  
  // Vérifier si l'email existe déjà
  if (data.users.some(u => u.email === email)) {
    return res.status(400).json({ message: 'Cet email est déjà utilisé' });
  }
  
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
    role: role || 'user', // Par défaut, le rôle est 'user'
  };
  
  data.users.push(newUser);
  saveData(data);
  
  // Ne pas renvoyer le mot de passe
  const { password: pwd, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

// Routes pour les recettes
app.get('/recipes', (req, res) => {
  const data = loadData();
  const { featured } = req.query;
  
  if (featured === 'true') {
    return res.json(data.recipes.filter(recipe => recipe.featured));
  }
  
  res.json(data.recipes);
});

app.get('/recipes/:id', (req, res) => {
  const { id } = req.params;
  const data = loadData();
  
  const recipe = data.recipes.find(r => r.id === id);
  
  if (recipe) {
    res.json(recipe);
  } else {
    res.status(404).json({ message: 'Recette non trouvée' });
  }
});

app.post('/recipes', (req, res) => {
  const newRecipe = req.body;
  const data = loadData();
  
  // Assurer que l'ID est unique
  newRecipe.id = newRecipe.id || Date.now().toString();
  
  data.recipes.push(newRecipe);
  saveData(data);
  
  res.status(201).json(newRecipe);
});

app.put('/recipes/:id', (req, res) => {
  const { id } = req.params;
  const updatedRecipe = req.body;
  const data = loadData();
  
  const index = data.recipes.findIndex(r => r.id === id);
  
  if (index !== -1) {
    data.recipes[index] = { ...updatedRecipe, id };
    saveData(data);
    res.json(data.recipes[index]);
  } else {
    res.status(404).json({ message: 'Recette non trouvée' });
  }
});

app.delete('/recipes/:id', (req, res) => {
  const { id } = req.params;
  const data = loadData();
  
  const index = data.recipes.findIndex(r => r.id === id);
  
  if (index !== -1) {
    data.recipes.splice(index, 1);
    
    // Supprimer également les favoris associés
    data.favorites = data.favorites.filter(f => f.recipeId !== id);
    
    saveData(data);
    res.json({ message: 'Recette supprimée avec succès' });
  } else {
    res.status(404).json({ message: 'Recette non trouvée' });
  }
});

// Routes pour les favoris
app.get('/favorites', (req, res) => {
  const { userId } = req.query;
  const data = loadData();
  
  if (userId) {
    const userFavorites = data.favorites.filter(f => f.userId === userId);
    res.json(userFavorites);
  } else {
    res.json(data.favorites);
  }
});

app.post('/favorites', (req, res) => {
  const { userId, recipeId } = req.body;
  const data = loadData();
  
  // Vérifier si le favori existe déjà
  const existingFavorite = data.favorites.find(
    f => f.userId === userId && f.recipeId === recipeId
  );
  
  if (existingFavorite) {
    return res.status(400).json({ message: 'Cette recette est déjà dans vos favoris' });
  }
  
  const newFavorite = {
    id: Date.now().toString(),
    userId,
    recipeId,
  };
  
  data.favorites.push(newFavorite);
  saveData(data);
  
  res.status(201).json(newFavorite);
});

app.delete('/favorites/:recipeId', (req, res) => {
  const { recipeId } = req.params;
  const { userId } = req.query;
  const data = loadData();
  
  const index = data.favorites.findIndex(
    f => f.recipeId === recipeId && f.userId === userId
  );
  
  if (index !== -1) {
    data.favorites.splice(index, 1);
    saveData(data);
    res.json({ message: 'Favori supprimé avec succès' });
  } else {
    res.status(404).json({ message: 'Favori non trouvé' });
  }
});

// Routes pour les utilisateurs
app.get('/users', (req, res) => {
  const data = loadData();
  
  // Ne pas renvoyer les mots de passe
  const usersWithoutPasswords = data.users.map(({ password, ...user }) => user);
  
  res.json(usersWithoutPasswords);
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});