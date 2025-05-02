import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  BookOpen, 
  Plus, 
  Edit, 
  Trash, 
  Search,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('recipes');
  const [recipes, setRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [notification, setNotification] = useState(null);

  // Form state
  const [recipeForm, setRecipeForm] = useState({
    title: '',
    description: '',
    prepTime: 30,
    difficulty: 'Facile',
    ingredients: '',
    instructions: '',
    image: '',
    featured: false,
    rating: 4.5
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recipes
        const recipesResponse = await fetch('http://localhost:3000/recipes');
        if (recipesResponse.ok) {
          const recipesData = await recipesResponse.json();
          setRecipes(recipesData);
        }

        // Fetch users
        const usersResponse = await fetch('http://localhost:3000/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRecipeForm({
      ...recipeForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault();
    
    try {
      const method = currentRecipe ? 'PUT' : 'POST';
      const url = currentRecipe 
        ? `http://localhost:3000/recipes/${currentRecipe.id}` 
        : 'http://localhost:3000/recipes';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...recipeForm,
          id: currentRecipe?.id || Date.now().toString(),
          ingredients: recipeForm.ingredients.split('\n'),
          instructions: recipeForm.instructions.split('\n')
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (currentRecipe) {
          setRecipes(recipes.map(r => r.id === data.id ? data : r));
          showNotification('Recette mise à jour avec succès');
        } else {
          setRecipes([...recipes, data]);
          showNotification('Recette ajoutée avec succès');
        }
        
        resetForm();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout/modification de la recette:', error);
      showNotification('Erreur lors de l\'enregistrement de la recette', 'error');
    }
  };

  const handleEditRecipe = (recipe) => {
    setCurrentRecipe(recipe);
    setRecipeForm({
      ...recipe,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : recipe.ingredients,
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : recipe.instructions
    });
    setShowRecipeForm(true);
  };

  const handleDeleteRecipe = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/recipes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRecipes(recipes.filter(recipe => recipe.id !== id));
        showNotification('Recette supprimée avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la recette:', error);
      showNotification('Erreur lors de la suppression de la recette', 'error');
    }
  };

  const resetForm = () => {
    setRecipeForm({
      title: '',
      description: '',
      prepTime: 30,
      difficulty: 'Facile',
      ingredients: '',
      instructions: '',
      image: '',
      featured: false,
      rating: 4.5
    });
    setCurrentRecipe(null);
    setShowRecipeForm(false);
  };

  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-red-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Dashboard Admin</h1>
          <p className="text-red-100">Gérez les recettes et les utilisateurs de la plateforme.</p>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${
          notification.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'
        }`}>
          <div className="flex items-center">
            {notification.type === 'error' ? (
              <AlertCircle size={20} className="mr-2" />
            ) : (
              <CheckCircle size={20} className="mr-2" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'recipes'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('recipes')}
            >
              <BookOpen size={16} className="inline mr-1" />
              Recettes
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={16} className="inline mr-1" />
              Utilisateurs
            </button>
          </div>

          {/* Search and Add Button */}
          <div className="flex justify-between mb-6">
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={`Rechercher ${activeTab === 'recipes' ? 'une recette' : 'un utilisateur'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            {activeTab === 'recipes' && (
              <button
                onClick={() => setShowRecipeForm(!showRecipeForm)}
                className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-red-700 transition-colors"
              >
                {showRecipeForm ? 'Annuler' : (
                  <>
                    <Plus size={18} className="mr-1" />
                    Ajouter une recette
                  </>
                )}
              </button>
            )}
          </div>

          {/* Recipe Form */}
          {activeTab === 'recipes' && showRecipeForm && (
            <div className="bg-gray-50 p-6 rounded-md mb-6 border border-gray-200">
              <h3 className="text-lg font-medium mb-4">
                {currentRecipe ? 'Modifier la recette' : 'Ajouter une nouvelle recette'}
              </h3>
              
              <form onSubmit={handleAddRecipe}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={recipeForm.title}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={recipeForm.image}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={recipeForm.description}
                    onChange={handleInputChange}
                    required
                    rows="2"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temps de préparation (min)
                    </label>
                    <input
                      type="number"
                      name="prepTime"
                      value={recipeForm.prepTime}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulté
                    </label>
                    <select
                      name="difficulty"
                      value={recipeForm.difficulty}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Facile">Facile</option>
                      <option value="Moyen">Moyen</option>
                      <option value="Difficile">Difficile</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note (sur 5)
                    </label>
                    <input
                      type="number"
                      name="rating"
                      value={recipeForm.rating}
                      onChange={handleInputChange}
                      required
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ingrédients (un par ligne)
                    </label>
                    <textarea
                      name="ingredients"
                      value={recipeForm.ingredients}
                      onChange={handleInputChange}
                      required
                      rows="5"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="200g de farine&#10;3 œufs&#10;100g de sucre"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions (une par ligne)
                    </label>
                    <textarea
                      name="instructions"
                      value={recipeForm.instructions}
                      onChange={handleInputChange}
                      required
                      rows="5"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Mélanger les ingrédients secs&#10;Ajouter les œufs un à un&#10;Cuire à 180°C pendant 25 minutes"
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={recipeForm.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                    Mettre en avant sur la page d'accueil
                  </label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    {currentRecipe ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Content based on active tab */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chargement des données...</p>
            </div>
          ) : activeTab === 'recipes' ? (
            // Recipes Table
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recette
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Temps
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulté
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mise en avant
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecipes.length > 0 ? (
                    filteredRecipes.map((recipe) => (
                      <tr key={recipe.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3">
                              {recipe.image ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={recipe.image} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <BookOpen size={16} className="text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{recipe.title}</div>
                              <div className="text-gray-500 text-sm truncate max-w-xs">{recipe.description.substring(0, 60)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {recipe.prepTime} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {recipe.difficulty}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {recipe.rating}/5
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {recipe.featured ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Oui
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Non
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditRecipe(recipe)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucune recette trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            // Users Table
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'inscription
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3">
                              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date().toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;