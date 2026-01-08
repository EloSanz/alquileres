'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [rates, setRates] = useState<{ ARS: number; PEN: number } | null>(null);
  const [amounts, setAmounts] = useState({
    usd: '',
    ars: '',
    pen: '',
  });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();
        setRates({
          ARS: data.rates.ARS,
          PEN: data.rates.PEN,
        });
      } catch (error) {
        console.error('Error fetching rates:', error);
      }
    };

    fetchRates();
  }, []);

  const handleInputChange = (currency: 'usd' | 'ars' | 'pen', value: string) => {
    if (value === '') {
      setAmounts({ usd: '', ars: '', pen: '' });
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return; // Or handle as you prefer, strictly numbers for now

    if (!rates) return;

    let newAmounts = { usd: '', ars: '', pen: '' };

    if (currency === 'usd') {
      newAmounts = {
        usd: value,
        ars: (numValue * rates.ARS).toFixed(2),
        pen: (numValue * rates.PEN).toFixed(2),
      };
    } else if (currency === 'ars') {
      const usdVal = numValue / rates.ARS;
      newAmounts = {
        usd: usdVal.toFixed(2),
        ars: value,
        pen: (usdVal * rates.PEN).toFixed(2),
      };
    } else if (currency === 'pen') {
      const usdVal = numValue / rates.PEN;
      newAmounts = {
        usd: usdVal.toFixed(2),
        ars: (usdVal * rates.ARS).toFixed(2),
        pen: value,
      };
    }

    setAmounts(newAmounts);
  };

  if (!rates) return <div className="loading">Cargando tasas de cambio...</div>;

  return (
    <div className="container">
      <main className="card">
        <h1>Conversor de Moneda</h1>
        <p className="subtitle">Tasas actualizadas: USD 1 = ARS {rates.ARS} | PEN {rates.PEN}</p>

        <div className="input-group">
          <label htmlFor="usd">Dólares (USD)</label>
          <input
            id="usd"
            type="number"
            value={amounts.usd}
            onChange={(e) => handleInputChange('usd', e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="input-group">
          <label htmlFor="pen">Soles (PEN)</label>
          <input
            id="pen"
            type="number"
            value={amounts.pen}
            onChange={(e) => handleInputChange('pen', e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="input-group">
          <label htmlFor="ars">Pesos Argentinos (ARS)</label>
          <input
            id="ars"
            type="number"
            value={amounts.ars}
            onChange={(e) => handleInputChange('ars', e.target.value)}
            placeholder="0.00"
          />
        </div>
      </main>
    </div>
  );
}
