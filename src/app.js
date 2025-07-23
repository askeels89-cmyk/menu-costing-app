import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Download, Save, Calculator, DollarSign, Menu, X, ChevronDown, ChevronUp, FileText, Printer } from 'lucide-react';

const MenuCostingModule = () => {
  const [activeTab, setActiveTab] = useState('ingredients');
  
  // Ingredients state with localStorage persistence
  const [ingredients, setIngredients] = useState(() => {
    try {
      const saved = localStorage.getItem('menu-costing-ingredients');
      return saved ? JSON.parse(saved) : [
        { id: 1, name: 'Chicken Breast', unit: 'kg', cost: 8.50, category: 'Protein', portionsPerUnit: 8 },
        { id: 2, name: 'Tomatoes', unit: 'kg', cost: 3.20, category: 'Vegetables', portionsPerUnit: 10 },
        { id: 3, name: 'Milk', unit: 'L', cost: 1.30, category: 'Dairy', portionsPerUnit: 8 },
        { id: 4, name: 'Rice', unit: 'kg', cost: 2.10, category: 'Grains', portionsPerUnit: 20 },
      ];
    } catch (e) {
      return [
        { id: 1, name: 'Chicken Breast', unit: 'kg', cost: 8.50, category: 'Protein', portionsPerUnit: 8 },
        { id: 2, name: 'Tomatoes', unit: 'kg', cost: 3.20, category: 'Vegetables', portionsPerUnit: 10 },
        { id: 3, name: 'Milk', unit: 'L', cost: 1.30, category: 'Dairy', portionsPerUnit: 8 },
        { id: 4, name: 'Rice', unit: 'kg', cost: 2.10, category: 'Grains', portionsPerUnit: 20 },
      ];
    }
  });
  
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    unit: 'kg',
    cost: '',
    category: 'Protein',
    portionsPerUnit: ''
  });

  // Recipe builder state
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [recipeName, setRecipeName] = useState('');
  const [recipeCategory, setRecipeCategory] = useState('Food');
  
  // Costing state
  const [profitMargin, setProfitMargin] = useState(30);
  const [includeVAT, setIncludeVAT] = useState(true);
  
  // Menu items state with localStorage persistence
  const [menuItems, setMenuItems] = useState(() => {
    try {
      const saved = localStorage.getItem('menu-costing-menu-items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  // Mobile UI state
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedCosts, setExpandedCosts] = useState(true);

  const units = ['kg', 'g', 'L', 'ml', 'each', 'dozen'];
  const ingredientCategories = ['Protein', 'Vegetables', 'Dairy', 'Grains', 'Beverages', 'Condiments', 'Other'];
  const menuCategories = ['Hot Drinks', 'Cold Drinks', 'Food', 'Snacks', 'Desserts'];

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('menu-costing-ingredients', JSON.stringify(ingredients));
    } catch (e) {
      console.warn('Could not save ingredients to localStorage');
    }
  }, [ingredients]);

  useEffect(() => {
    try {
      localStorage.setItem('menu-costing-menu-items', JSON.stringify(menuItems));
    } catch (e) {
      console.warn('Could not save menu items to localStorage');
    }
  }, [menuItems]);

  // Ingredient CRUD operations
  const addIngredient = () => {
    if (newIngredient.name && newIngredient.cost && newIngredient.portionsPerUnit) {
      const ingredient = {
        id: Date.now(),
        ...newIngredient,
        cost: parseFloat(newIngredient.cost),
        portionsPerUnit: parseFloat(newIngredient.portionsPerUnit)
      };
      setIngredients([...ingredients, ingredient]);
      setNewIngredient({ name: '', unit: 'kg', cost: '', category: 'Protein', portionsPerUnit: '' });
      setShowAddForm(false);
    }
  };

  const updateIngredient = (id, updatedData) => {
    setIngredients(ingredients.map(ing => 
      ing.id === id ? { 
        ...ing, 
        ...updatedData, 
        cost: parseFloat(updatedData.cost),
        portionsPerUnit: parseFloat(updatedData.portionsPerUnit)
      } : ing
    ));
    setEditingIngredient(null);
  };

  const deleteIngredient = (id) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
    setSelectedIngredients(selectedIngredients.filter(si => si.ingredientId !== id));
  };

  // Recipe builder functions
  const addIngredientToRecipe = () => {
    const newId = Date.now();
    setSelectedIngredients([...selectedIngredients, {
      id: newId,
      ingredientId: '',
      quantity: ''
    }]);
  };

  const updateRecipeIngredient = (id, field, value) => {
    setSelectedIngredients(selectedIngredients.map(si =>
      si.id === id ? { ...si, [field]: value } : si
    ));
  };

  const removeRecipeIngredient = (id) => {
    setSelectedIngredients(selectedIngredients.filter(si => si.id !== id));
  };

  // Cost calculations
  const calculateCosts = () => {
    const ingredientCost = selectedIngredients.reduce((total, si) => {
      const ingredient = ingredients.find(ing => ing.id === parseInt(si.ingredientId));
      if (ingredient && si.quantity) {
        // Calculate cost per portion, then multiply by quantity of portions needed
        const costPerPortion = ingredient.portionsPerUnit ? (ingredient.cost / ingredient.portionsPerUnit) : ingredient.cost;
        return total + (costPerPortion * parseFloat(si.quantity));
      }
      return total;
    }, 0);

    const laborCost = ingredientCost * 0.25;
    const overheadCost = ingredientCost * 0.25;
    const totalCost = ingredientCost + laborCost + overheadCost;
    
    const profitAmount = totalCost * (profitMargin / 100);
    const sellingPrice = totalCost + profitAmount;
    
    const vatAmount = includeVAT ? sellingPrice * 0.20 : 0;
    const finalPrice = sellingPrice + vatAmount;

    return {
      ingredientCost,
      laborCost,
      overheadCost,
      totalCost,
      profitAmount,
      sellingPrice,
      vatAmount,
      finalPrice
    };
  };

  const costs = calculateCosts();

  // Save menu item
  const saveMenuItem = () => {
    if (recipeName && selectedIngredients.length > 0) {
      const menuItem = {
        id: Date.now(),
        name: recipeName,
        category: recipeCategory,
        ingredients: selectedIngredients.map(si => {
          const ingredient = ingredients.find(ing => ing.id === parseInt(si.ingredientId));
          return {
            ...si,
            ingredientName: ingredient?.name,
            ingredientCost: ingredient?.cost,
            totalCost: ingredient ? ingredient.cost * parseFloat(si.quantity || 0) : 0
          };
        }),
        costs: costs,
        profitMargin,
        includeVAT,
        createdAt: new Date().toLocaleDateString()
      };
      
      setMenuItems([...menuItems, menuItem]);
      
      // Reset form
      setRecipeName('');
      setSelectedIngredients([]);
      setProfitMargin(30);
      setIncludeVAT(true);
      
      // Show success message with haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
      alert('✅ Recipe saved successfully!');
    }
  };

  // CSV download template
  const downloadCSVTemplate = () => {
    const csvContent = "Ingredient Name,Unit of Measurement,Cost per Unit,Category,Portions per Unit\nChicken Breast,kg,8.50,Protein,8\nTomatoes,kg,3.20,Vegetables,10\nMilk,L,1.30,Dairy,8\nRice,kg,2.10,Grains,20";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'ingredients_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // PDF generation for recipes
  const generateRecipePDF = (recipe) => {
    const printWindow = window.open('', '_blank');
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${recipe.name} - Recipe Cost Sheet</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6; 
            color: #333; 
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
          }
          .header h1 { 
            color: #3b82f6; 
            font-size: 28px; 
            margin-bottom: 10px;
          }
          .header .subtitle { 
            color: #6b7280; 
            font-size: 16px;
          }
          .recipe-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .info-box {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          .info-label {
            font-weight: bold;
            color: #374151;
            margin-bottom: 5px;
          }
          .ingredients-section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .ingredients-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .ingredients-table th,
          .ingredients-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          .ingredients-table th {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #374151;
          }
          .ingredients-table tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .cost-breakdown {
            background: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .cost-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0f2fe;
          }
          .cost-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 18px;
            color: #1e40af;
            margin-top: 10px;
            padding-top: 15px;
            border-top: 2px solid #3b82f6;
          }
          .profit-section {
            background: #f0fdf4;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .final-pricing {
            background: #1e40af;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
          }
          .final-price {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .print-buttons {
            margin-top: 30px;
            text-align: center;
          }
          .print-btn {
            background: #3b82f6; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            font-size: 16px; 
            cursor: pointer;
            margin: 0 5px;
            touch-action: manipulation;
          }
          .close-btn {
            background: #6b7280;
          }
          @media print {
            body { padding: 0; }
            .print-buttons { display: none; }
          }
          @media (max-width: 600px) {
            body { padding: 10px; }
            .recipe-info { grid-template-columns: 1fr; }
            .ingredients-table { font-size: 14px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${recipe.name}</h1>
          <div class="subtitle">Recipe Cost Analysis & Pricing Sheet</div>
        </div>

        <div class="recipe-info">
          <div class="info-box">
            <div class="info-label">Category</div>
            <div>${recipe.category}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Created Date</div>
            <div>${recipe.createdAt}</div>
          </div>
        </div>

        <div class="ingredients-section">
          <h2 class="section-title">Ingredients (${recipe.ingredients.length} items)</h2>
          <table class="ingredients-table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Quantity</th>
                <th>Unit Cost</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              ${recipe.ingredients.map(ing => `
                <tr>
                  <td>${ing.ingredientName}</td>
                  <td>${ing.quantity}</td>
                  <td>£${ing.ingredientCost?.toFixed(2) || '0.00'}</td>
                  <td>£${ing.totalCost.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="cost-breakdown">
          <h2 class="section-title">Cost Breakdown</h2>
          <div class="cost-row">
            <span>Raw Ingredients Cost:</span>
            <span>£${recipe.costs.ingredientCost.toFixed(2)}</span>
          </div>
          <div class="cost-row">
            <span>Labour Cost (25%):</span>
            <span>£${recipe.costs.laborCost.toFixed(2)}</span>
          </div>
          <div class="cost-row">
            <span>Overhead Cost (25%):</span>
            <span>£${recipe.costs.overheadCost.toFixed(2)}</span>
          </div>
          <div class="cost-row">
            <span>Total Production Cost:</span>
            <span>£${recipe.costs.totalCost.toFixed(2)}</span>
          </div>
        </div>

        <div class="profit-section">
          <h2 class="section-title">Profit Analysis</h2>
          <div class="cost-row">
            <span>Profit Margin:</span>
            <span>${recipe.profitMargin}%</span>
          </div>
          <div class="cost-row">
            <span>Profit Amount:</span>
            <span>£${recipe.costs.profitAmount.toFixed(2)}</span>
          </div>
          <div class="cost-row">
            <span>Selling Price (ex VAT):</span>
            <span>£${recipe.costs.sellingPrice.toFixed(2)}</span>
          </div>
          ${recipe.includeVAT ? `
            <div class="cost-row">
              <span>VAT (20%):</span>
              <span>£${recipe.costs.vatAmount.toFixed(2)}</span>
            </div>
          ` : ''}
        </div>

        <div class="final-pricing">
          <div class="final-price">£${recipe.costs.finalPrice.toFixed(2)}</div>
          <div>Final Selling Price ${recipe.includeVAT ? '(inc VAT)' : '(ex VAT)'}</div>
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} - Menu Costing Pro</p>
          <p>Profit per item: £${recipe.costs.profitAmount.toFixed(2)} | Margin: ${recipe.profitMargin}%</p>
        </div>

        <div class="print-buttons">
          <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
          <button class="print-btn close-btn" onclick="window.close()">✕ Close</button>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(pdfContent);
    printWindow.document.close();
  };

  // Download all recipes as combined PDF
  const downloadAllRecipesPDF = () => {
    const printWindow = window.open('', '_blank');
    const allRecipesContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Complete Menu Cost Analysis</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6; 
            color: #333; 
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
          }
          .header h1 { 
            color: #3b82f6; 
            font-size: 32px; 
            margin-bottom: 10px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 40px;
          }
          .summary-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #3b82f6;
          }
          .summary-card .number {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 5px;
          }
          .summary-card .label {
            color: #6b7280;
            font-size: 14px;
          }
          .recipe-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .recipe-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          .recipe-name {
            font-size: 20px;
            font-weight: bold;
            color: #374151;
          }
          .recipe-category {
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: medium;
          }
          .cost-summary {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
          }
          .cost-item {
            text-align: center;
            padding: 10px;
            background: #f9fafb;
            border-radius: 6px;
          }
          .cost-item .value {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
          }
          .cost-item .label {
            font-size: 12px;
            color: #6b7280;
            margin-top: 5px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .print-buttons {
            margin-top: 30px;
            text-align: center;
          }
          .print-btn {
            background: #3b82f6; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            font-size: 16px; 
            cursor: pointer;
            margin: 0 5px;
            touch-action: manipulation;
          }
          .close-btn {
            background: #6b7280;
          }
          @media print {
            body { padding: 0; }
            .print-buttons { display: none; }
          }
          @media (max-width: 600px) {
            body { padding: 10px; }
            .summary-grid { grid-template-columns: 1fr 1fr; }
            .cost-summary { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Complete Menu Cost Analysis</h1>
          <div>Generated on ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="number">${menuItems.length}</div>
            <div class="label">Total Recipes</div>
          </div>
          <div class="summary-card">
            <div class="number">£${menuItems.reduce((sum, item) => sum + item.costs.totalCost, 0).toFixed(2)}</div>
            <div class="label">Total Production Cost</div>
          </div>
          <div class="summary-card">
            <div class="number">£${menuItems.reduce((sum, item) => sum + item.costs.profitAmount, 0).toFixed(2)}</div>
            <div class="label">Total Profit Potential</div>
          </div>
          <div class="summary-card">
            <div class="number">£${menuItems.reduce((sum, item) => sum + item.costs.finalPrice, 0).toFixed(2)}</div>
            <div class="label">Total Menu Value</div>
          </div>
        </div>

        ${menuItems.map(recipe => `
          <div class="recipe-card">
            <div class="recipe-header">
              <div class="recipe-name">${recipe.name}</div>
              <div class="recipe-category">${recipe.category}</div>
            </div>
            
            <div><strong>Ingredients:</strong> ${recipe.ingredients.length} items</div>
            <div><strong>Profit Margin:</strong> ${recipe.profitMargin}%</div>
            <div><strong>VAT:</strong> ${recipe.includeVAT ? 'Included (20%)' : 'Not included'}</div>
            
            <div class="cost-summary">
              <div class="cost-item">
                <div class="value">£${recipe.costs.totalCost.toFixed(2)}</div>
                <div class="label">Production Cost</div>
              </div>
              <div class="cost-item">
                <div class="value">£${recipe.costs.profitAmount.toFixed(2)}</div>
                <div class="label">Profit Amount</div>
              </div>
              <div class="cost-item">
                <div class="value">£${recipe.costs.finalPrice.toFixed(2)}</div>
                <div class="label">Final Price</div>
              </div>
            </div>
          </div>
        `).join('')}

        <div class="footer">
          <p>Menu Costing Pro - Complete Analysis Report</p>
        </div>

        <div class="print-buttons">
          <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
          <button class="print-btn close-btn" onclick="window.close()">✕ Close</button>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(allRecipesContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 safe-area-inset">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Menu Costing Pro</h1>
        </div>
        
        {/* Mobile Navigation Tabs */}
        <div className="flex overflow-x-auto bg-white border-t">
          {[
            { id: 'ingredients', label: 'Ingredients', icon: '🥘' },
            { id: 'recipe', label: 'Recipe', icon: '🍳' },
            { id: 'menu', label: 'Menu', icon: '📋' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 pb-20">
        {/* Ingredients Database Tab */}
        {activeTab === 'ingredients' && (
          <div className="space-y-4">
            {/* Mobile Add Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Ingredients ({ingredients.length})</h2>
              <div className="flex space-x-2">
                <button
                  onClick={downloadCSVTemplate}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  title="Download CSV Template"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            </div>

            {/* Add/Edit Form */}
            {(showAddForm || editingIngredient) && (
              <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
                <h3 className="font-medium">{editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}</h3>
                
                <input
                  type="text"
                  placeholder="Ingredient Name"
                  value={editingIngredient ? editingIngredient.name : newIngredient.name}
                  onChange={(e) => editingIngredient 
                    ? setEditingIngredient({...editingIngredient, name: e.target.value})
                    : setNewIngredient({...newIngredient, name: e.target.value})
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={editingIngredient ? editingIngredient.unit : newIngredient.unit}
                    onChange={(e) => editingIngredient
                      ? setEditingIngredient({...editingIngredient, unit: e.target.value})
                      : setNewIngredient({...newIngredient, unit: e.target.value})
                    }
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                  
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Cost per unit (£)"
                    value={editingIngredient ? editingIngredient.cost : newIngredient.cost}
                    onChange={(e) => editingIngredient
                      ? setEditingIngredient({...editingIngredient, cost: e.target.value})
                      : setNewIngredient({...newIngredient, cost: e.target.value})
                    }
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={editingIngredient ? editingIngredient.category : newIngredient.category}
                    onChange={(e) => editingIngredient
                      ? setEditingIngredient({...editingIngredient, category: e.target.value})
                      : setNewIngredient({...newIngredient, category: e.target.value})
                    }
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  >
                    {ingredientCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Portions per unit"
                    value={editingIngredient ? editingIngredient.portionsPerUnit : newIngredient.portionsPerUnit}
                    onChange={(e) => editingIngredient
                      ? setEditingIngredient({...editingIngredient, portionsPerUnit: e.target.value})
                      : setNewIngredient({...newIngredient, portionsPerUnit: e.target.value})
                    }
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={editingIngredient 
                      ? () => updateIngredient(editingIngredient.id, editingIngredient)
                      : addIngredient
                    }
                    disabled={editingIngredient 
                      ? !editingIngredient.name || !editingIngredient.cost || !editingIngredient.portionsPerUnit
                      : !newIngredient.name || !newIngredient.cost || !newIngredient.portionsPerUnit
                    }
                    className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {editingIngredient ? 'Update' : 'Add'} Ingredient
                  </button>
                  
                  <button
                    onClick={() => {
                      setEditingIngredient(null);
                      setShowAddForm(false);
                    }}
                    className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Ingredients List */}
            <div className="space-y-3">
              {ingredients.map(ingredient => {
                const costPerPortion = ingredient.portionsPerUnit ? (ingredient.cost / ingredient.portionsPerUnit) : 0;
                
                return (
                  <div key={ingredient.id} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 truncate">{ingredient.name}</h3>
                        <div className="text-sm text-gray-600 mt-1 space-y-1">
                          <p>£{ingredient.cost.toFixed(2)} per {ingredient.unit}</p>
                          {ingredient.portionsPerUnit && (
                            <>
                              <p>{ingredient.portionsPerUnit} portions per {ingredient.unit}</p>
                              <p className="font-semibold text-blue-600">
                                £{costPerPortion.toFixed(2)} per portion
                              </p>
                            </>
                          )}
                        </div>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">
                          {ingredient.category}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2 ml-3">
                        <button
                          onClick={() => setEditingIngredient(ingredient)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteIngredient(ingredient.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recipe Builder Tab */}
        {activeTab === 'recipe' && (
          <div className="space-y-6">
            {/* Recipe Details */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">Recipe Details</h2>
              
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Recipe Name"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
                
                <select
                  value={recipeCategory}
                  onChange={(e) => setRecipeCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                >
                  {menuCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ingredients Selection */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Recipe Ingredients</h3>
                <button
                  onClick={addIngredientToRecipe}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {selectedIngredients.map(si => {
                  const ingredient = ingredients.find(ing => ing.id === parseInt(si.ingredientId));
                  const cost = ingredient && si.quantity ? ingredient.cost * parseFloat(si.quantity) : 0;
                  
                  return (
                    <div key={si.id} className="border border-gray-200 rounded-lg p-3 space-y-3">
                      <select
                        value={si.ingredientId}
                        onChange={(e) => updateRecipeIngredient(si.id, 'ingredientId', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select ingredient...</option>
                        {ingredients.map(ing => {
                          const costPerPortion = ing.portionsPerUnit ? (ing.cost / ing.portionsPerUnit) : ing.cost;
                          return (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} (£{costPerPortion.toFixed(2)}/portion)
                            </option>
                          );
                        })}
                      </select>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Quantity"
                          value={si.quantity}
                          onChange={(e) => updateRecipeIngredient(si.id, 'quantity', e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        
                        <div className="text-sm font-medium text-gray-700 min-w-16">
                          £{cost.toFixed(2)}
                        </div>
                        
                        <button
                          onClick={() => removeRecipeIngredient(si.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Cost Analysis</h3>
                <button
                  onClick={() => setExpandedCosts(!expandedCosts)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {expandedCosts ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
              
              {expandedCosts && (
                <div className="space-y-4">
                  {/* Basic Costs */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Ingredient Cost:</span>
                      <span className="font-medium">£{costs.ingredientCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Labour Cost (25%):</span>
                      <span className="font-medium">£{costs.laborCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Overhead Cost (25%):</span>
                      <span className="font-medium">£{costs.overheadCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total Cost:</span>
                      <span>£{costs.totalCost.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Profit Controls */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Profit Margin: {profitMargin}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={profitMargin}
                      onChange={(e) => setProfitMargin(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${profitMargin}%, #e5e7eb ${profitMargin}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="vat"
                      checked={includeVAT}
                      onChange={(e) => setIncludeVAT(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="vat" className="text-sm">Include VAT (20%)</label>
                  </div>

                  {/* Final Pricing */}
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Profit Amount:</span>
                      <span className="font-medium text-green-600">£{costs.profitAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Selling Price (ex VAT):</span>
                      <span className="font-medium">£{costs.sellingPrice.toFixed(2)}</span>
                    </div>
                    {includeVAT && (
                      <div className="flex justify-between text-sm">
                        <span>VAT (20%):</span>
                        <span className="font-medium">£{costs.vatAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Final Price:</span>
                      <span className="text-blue-600">£{costs.finalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={saveMenuItem}
                      disabled={!recipeName || selectedIngredients.length === 0}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save size={16} />
                      <span>Save Recipe</span>
                    </button>
                    
                    {recipeName && selectedIngredients.length > 0 && (
                      <button
                        onClick={() => {
                          const tempRecipe = {
                            id: 'preview',
                            name: recipeName,
                            category: recipeCategory,
                            ingredients: selectedIngredients.map(si => {
                              const ingredient = ingredients.find(ing => ing.id === parseInt(si.ingredientId));
                              return {
                                ...si,
                                ingredientName: ingredient?.name,
                                ingredientCost: ingredient?.cost,
                                totalCost: ingredient ? ingredient.cost * parseFloat(si.quantity || 0) : 0
                              };
                            }),
                            costs: costs,
                            profitMargin,
                            includeVAT,
                            createdAt: new Date().toLocaleDateString()
                          };
                          generateRecipePDF(tempRecipe);
                        }}
                        className="flex items-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Printer size={16} />
                        <span className="hidden sm:inline">Preview PDF</span>
                        <span className="sm:hidden">PDF</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menu Items Tab */}
        {activeTab === 'menu' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
              <h2 className="text-lg font-semibold">Menu Items ({menuItems.length})</h2>
              {menuItems.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={downloadAllRecipesPDF}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm transition-colors"
                  >
                    <FileText size={16} />
                    <span className="hidden sm:inline">Download All</span>
                    <span className="sm:hidden">All PDF</span>
                  </button>
                </div>
              )}
            </div>

            {menuItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Calculator size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No menu items yet</h3>
                <p className="text-gray-500">Create your first recipe to see it here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex space-x-2 ml-2">
                        <button
                          onClick={() => generateRecipePDF(item)}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          title="Download PDF"
                        >
                          <FileText size={16} />
                        </button>
                        <button
                          onClick={() => setMenuItems(menuItems.filter(mi => mi.id !== item.id))}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <div className="font-medium text-gray-800">£{item.costs.totalCost.toFixed(2)}</div>
                        <div className="text-xs text-gray-600">Total Cost</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded text-center">
                        <div className="font-medium text-green-600">£{item.costs.profitAmount.toFixed(2)}</div>
                        <div className="text-xs text-gray-600">Profit ({item.profitMargin}%)</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <div className="font-medium text-blue-600">£{item.costs.finalPrice.toFixed(2)}</div>
                        <div className="text-xs text-gray-600">Final Price</div>
                      </div>
                      <div className="bg-purple-50 p-2 rounded text-center">
                        <div className="font-medium text-purple-600">{item.ingredients.length}</div>
                        <div className="text-xs text-gray-600">Ingredients</div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Created: {item.createdAt} • VAT: {item.includeVAT ? 'Included' : 'Not included'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuCostingModule;