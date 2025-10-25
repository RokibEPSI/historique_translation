import React, { useState, useEffect } from 'react';

// --- INTERFACE TYPE SCRIPT DÉFINIE ---
interface Transaction {
  id: string;
  type: string;
  state: 'completed' | 'pending' | 'failed'; 
  amount: number;
  currency: string;
  created_at: string;
  reference?: string; 
  merchant?: { 
    name: string;
    city: string;
  };
}
// ------------------------------------

function TransactionHistory() {
  // Application du type Transaction[] à l'état
  const [transactions, setTransactions] = useState<Transaction[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Appel vers VOTRE Backend (port 5000)
        const response = await fetch('http://localhost:5000/api/transactions');
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données de votre Backend.');
        }

        const result = await response.json();
        
        if (Array.isArray(result.data)) {
            setTransactions(result.data); 
        } else {
             throw new Error('Format de données inattendu.');
        }

      } catch (err) {
        console.error("Erreur de Fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <div>Chargement de l'historique...</div>;

// --- REMPLACEZ LA SECTION RETURN PAR CECI DANS src/App.tsx ---
return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Historique Revolut (Simulé)</h1>
        <p style={{ color: '#007bff' }}>Les données proviennent de votre Backend sur le port 5000.</p>
        
        {/* Ajout d'un tableau HTML simple pour forcer l'affichage */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
                <tr style={{ borderBottom: '2px solid #333' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Montant</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Statut</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map(tx => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px', textAlign: 'left' }}>
                            <strong>{tx.merchant?.name || tx.reference || tx.type}</strong>
                            <div style={{ fontSize: '0.8em', color: '#666' }}>{new Date(tx.created_at).toLocaleString()}</div>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: tx.amount < 0 ? '#dc3545' : '#28a745' }}>
                            {tx.amount.toFixed(2)} {tx.currency}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', color: tx.state === 'completed' ? 'green' : 'orange' }}>
                            {tx.state.toUpperCase()}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
// -----------------------------------------------------------------
}

// C'est la ligne qui exporte le composant pour qu'il soit utilisé par React
export default TransactionHistory;