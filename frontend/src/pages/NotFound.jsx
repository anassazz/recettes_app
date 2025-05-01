import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <ChefHat size={80} className="text-red-600" />
            <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              ?
            </div>
          </div>
        </div>
        
        <h1 className="text-9xl font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Recette introuvable</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          La page que vous recherchez semble avoir été mangée ou n'a jamais été cuisinée.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <ArrowLeft size={18} className="mr-2" />
          Retour à l'accueil
        </Link>
      </div>
      
      <div className="mt-12 p-6 bg-white rounded-lg shadow-md max-w-md w-full">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Vous pourriez essayer :</h3>
        <ul className="space-y-2 text-gray-600">
          <li>• Vérifier l'URL pour des erreurs de frappe</li>
          <li>• Retourner à la page d'accueil et naviguer à partir de là</li>
          <li>• Utiliser la barre de recherche pour trouver une recette spécifique</li>
          <li>• Consulter nos recettes populaires</li>
        </ul>
      </div>
    </div>
  );
};

export default NotFound;