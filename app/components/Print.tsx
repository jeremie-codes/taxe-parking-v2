import * as Print from 'expo-print';

interface ReceiptData {
  plaque: string;
  date: any;
  taxateur: string;
  logo: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};


export default async function printReceipt(data: ReceiptData) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page {
            size: auto;
            margin: 0;
            padding: 0;
          }

          body {
            width: 100%;
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }

          .container {
            width: 100%;
            max-width: 384px; /* Adapté pour imprimante 58mm */
            margin: auto;
            padding: 10px;
            text-align: left;
          }

          .header h1 {
            margin: 0;
            line-height: 1.1;
            font-size: 36px;
            font-weight: bold;
          }

          .header h2 {
            margin: 0;
            line-height: 1.1;
            font-size: 28px;
          }

          .row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }

          .footer img {
            margin-top: 10px;
          }

          .content {
            font-size: 26px;
          }

          .divider {
            border-top: 2px dashed #000;
            margin: 10px 0;
          }
        </style>

      </head>
      <body>
        <div class="container">
          <div class="header" style="text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;">
            <img src="${decodeURIComponent(data.logo)}" style="width: 80px; height: auto;" />
            <div>
              <h1>TAXE PARKING</h1>
              <h2>STATIONNEMENT</h2>
              <h2>VILLE DE KINSHASA</h2>
            </div>
          </div>

          <div class="divider"></div>

          <div class="content">
            <div class="row"><span class="label">Numéro:</span><span>${data.plaque}</span></div>
            <div class="row"><span class="label">Date:</span><span>${data.date}</span></div>
            <div class="row"><span class="label">Montant:</span><span>500 FC</span></div>
            <div class="row"><span class="label">Heure:</span><span>${data.taxateur}</span></div>
            <div class="row"><span class="label">Parking:</span><span>FUNA</span></div>
          </div>

          <div class="divider"></div>

          <div class="footer" style="text-align: center;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data.plaque)}&size=120x120" alt="QR Code">
          </div>
        </div>
      </body>

      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    console.log('Reçu généré:', uri);
    
    // Optionnel: Imprimer directement
    await Print.printAsync({ uri });
    
    return uri;
  } catch (error) {
    console.error('Erreur lors de l\'impression:', error);
    throw error;
  }
};