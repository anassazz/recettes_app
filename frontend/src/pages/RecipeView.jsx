import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, 
  Heart, 
  Star, 
  ArrowLeft, 
  ChefHat, 
  AlertCircle, 
  CheckCircle,
  MessageSquare,
  ThumbsUp,
  Edit,
  Trash2
} from 'lucide-react';

const RecipeView = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ text: '', rating: 5 });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [showReviews, setShowReviews] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        // Fetch recipe details
        const response = await fetch(`http://localhost:3000/recipes/${id}`);
        if (response.ok) {
          const data = await response.json();
          setRecipe(data);
        } else {
          // If recipe not found, redirect to 404 page
          navigate('/not-found');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la recette:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkFavoriteStatus = async () => {
      if (!currentUser) return;
      
      try {
        const response = await fetch(`http://localhost:3000/favorites?userId=${currentUser.id}&recipeId=${id}`);
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.length > 0);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des favoris:', error);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:3000/reviews?recipeId=${id}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des avis:', error);
      }
    };

    fetchRecipe();
    checkFavoriteStatus();
    fetchReviews();
  }, [id, navigate, currentUser]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleFavorite = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      if (isFavorite) {
        // Supprimer des favoris
        await fetch(`http://localhost:3000/favorites/${id}?userId=${currentUser.id}`, {
          method: 'DELETE',
        });
        setIsFavorite(false);
        showNotification('Recette retirée des favoris');
      } else {
        // Ajouter aux favoris
        await fetch('http://localhost:3000/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.id,
            recipeId: id,
          }),
        });
        setIsFavorite(true);
        showNotification('Recette ajoutée aux favoris');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
      showNotification('Une erreur est survenue', 'error');
    }
  };

  // Handle review rating change
  const handleRatingChange = (rating) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  // Handle review text change
  const handleReviewTextChange = (e) => {
    setNewReview(prev => ({ ...prev, text: e.target.value }));
  };

  // Submit a new review
  const submitReview = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!newReview.text.trim()) {
      showNotification('Veuillez écrire un commentaire', 'error');
      return;
    }

    setIsSubmittingReview(true);
    
    try {
      if (editingReviewId) {
        // Update existing review
        const response = await fetch(`http://localhost:3000/reviews/${editingReviewId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: newReview.text,
            rating: newReview.rating
          }),
        });
        
        if (response.ok) {
          const updatedReview = await response.json();
          setReviews(reviews.map(r => r.id === editingReviewId ? updatedReview : r));
          showNotification('Avis mis à jour avec succès');
          setEditingReviewId(null);
        }
      } else {
        // Submit new review
        const response = await fetch('http://localhost:3000/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.id,
            userName: currentUser.displayName || 'Utilisateur',
            userAvatar: currentUser.photoURL || null,
            recipeId: id,
            text: newReview.text,
            rating: newReview.rating,
            createdAt: new Date().toISOString()
          }),
        });
        
        if (response.ok) {
          const newReviewData = await response.json();
          setReviews([...reviews, newReviewData]);
          showNotification('Avis publié avec succès');
        }
      }
      
      // Reset form
      setNewReview({ text: '', rating: 5 });
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'avis:', error);
      showNotification('Une erreur est survenue', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Edit a review
  const editReview = (review) => {
    setNewReview({ text: review.text, rating: review.rating });
    setEditingReviewId(review.id);
    // Scroll to review form
    document.getElementById('review-form').scrollIntoView({ behavior: 'smooth' });
  };

  // Delete a review
  const deleteReview = async (reviewId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId));
        showNotification('Avis supprimé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'avis:', error);
      showNotification('Une erreur est survenue', 'error');
    }
  };

  // Like a review
  const likeReview = async (reviewId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const reviewToUpdate = reviews.find(r => r.id === reviewId);
    
    // Check if user already liked this review
    const userLiked = reviewToUpdate.likes?.includes(currentUser.id);
    let updatedLikes = [...(reviewToUpdate.likes || [])];
    
    if (userLiked) {
      // Unlike
      updatedLikes = updatedLikes.filter(id => id !== currentUser.id);
    } else {
      // Like
      updatedLikes.push(currentUser.id);
    }
    
    try {
      const response = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          likes: updatedLikes
        }),
      });
      
      if (response.ok) {
        const updatedReview = await response.json();
        setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des likes:', error);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingReviewId(null);
    setNewReview({ text: '', rating: 5 });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Render star rating for input
  const renderRatingInput = () => {
    return (
      <div className="flex items-center space-x-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              size={24}
              className={`${
                star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              } cursor-pointer`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Render star rating display
  const renderRatingDisplay = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat size={48} className="mx-auto mb-4 text-red-600 animate-pulse" />
          <p className="text-gray-600">Chargement de la recette...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
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

      {/* Recipe Hero */}
      <div className="w-full h-64 md:h-96 bg-gray-200 relative">
        {recipe.image ? (
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat size={64} className="text-gray-400" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <button 
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center text-white/80 hover:text-white"
            >
              <ArrowLeft size={20} className="mr-1" />
              Retour
            </button>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{recipe.title}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                <span>{recipe.prepTime} min</span>
              </div>
              <div className="flex items-center">
                <span className="px-2 py-1 bg-white/20 rounded-md text-sm">{recipe.difficulty}</span>
              </div>
              <div className="flex items-center">
                <Star size={16} className="mr-1 text-yellow-400" />
                <span>{recipe.rating}/5</span>
              </div>
              <div className="flex items-center">
                <MessageSquare size={16} className="mr-1" />
                <span>{reviews.length} avis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">À propos de la recette</h2>
            <button
              onClick={toggleFavorite}
              className="flex items-center space-x-1 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              <Heart size={18} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"} />
              <span>{isFavorite ? 'Retiré des favoris' : 'Ajouter aux favoris'}</span>
            </button>
          </div>

          <p className="text-gray-600 mb-8">{recipe.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Ingredients */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">Ingrédients</h3>
              <ul className="space-y-2">
                {Array.isArray(recipe.ingredients) ? (
                  recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500 mt-2 mr-2"></span>
                      <span>{ingredient}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">Aucun ingrédient disponible</li>
                )}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">Instructions</h3>
              <ol className="space-y-4">
                {Array.isArray(recipe.instructions) ? (
                  recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{instruction}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">Aucune instruction disponible</li>
                )}
              </ol>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-md">
            <h3 className="font-semibold text-gray-800 mb-2">Astuces du chef</h3>
            <p className="text-gray-600">
              Cette recette se conserve jusqu'à 3 jours au réfrigérateur dans un contenant hermétique. 
              Vous pouvez remplacer certains ingrédients selon vos préférences ou restrictions alimentaires.
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <MessageSquare size={20} className="mr-2" />
              Avis ({reviews.length})
            </h2>
            <button 
              onClick={() => setShowReviews(!showReviews)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {showReviews ? 'Masquer les avis' : 'Afficher les avis'}
            </button>
          </div>

          {/* Reviews Form */}
          <div id="review-form" className="mb-8 border-b border-gray-200 pb-8">
            <h3 className="text-lg font-semibold mb-4">
              {editingReviewId ? 'Modifier votre avis' : 'Partagez votre avis'}
            </h3>
            
            {!currentUser ? (
              <div className="bg-blue-50 text-orange-700 p-4 rounded-md mb-4">
                <p>Connectez-vous pour laisser un avis sur cette recette.</p>
                <button 
                  onClick={() => navigate('/login')}
                  className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Se connecter
                </button>
              </div>
            ) : (
              <form onSubmit={submitReview}>
                {renderRatingInput()}
                
                <textarea
                  value={newReview.text}
                  onChange={handleReviewTextChange}
                  placeholder="Partagez votre expérience avec cette recette..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
                  rows={4}
                  required
                />
                
                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
                  >
                    {isSubmittingReview 
                      ? 'Publication...' 
                      : editingReviewId 
                        ? 'Mettre à jour' 
                        : 'Publier'}
                  </button>
                  
                  {editingReviewId && (
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Reviews List */}
          {showReviews && (
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <p className="text-gray-500 italic text-center py-8">
                  Soyez le premier à donner votre avis sur cette recette !
                </p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                          {review.userAvatar ? (
                            <img 
                              src={review.userAvatar} 
                              alt={review.userName} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-600">
                              {review.userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium text-gray-800">{review.userName}</p>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                          </div>
                          
                          <div className="mt-1">
                            {renderRatingDisplay(review.rating)}
                          </div>
                        </div>
                      </div>
                      
                      {currentUser && currentUser.id === review.userId && (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => editReview(review)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => deleteReview(review.id)}
                            className="text-gray-500 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <p className="mt-3 text-gray-700">{review.text}</p>
                    
                    <div className="mt-3 flex items-center">
                      <button 
                        onClick={() => likeReview(review.id)}
                        className={`flex items-center space-x-1 text-sm ${
                          currentUser && review.likes?.includes(currentUser.id)
                            ? 'text-orange-600'
                            : 'text-gray-500 hover:text-orange-600'
                        }`}
                      >
                        <ThumbsUp size={14} />
                        <span>{review.likes?.length || 0}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeView;