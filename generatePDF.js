import fs from "fs";
import nunjucks from "nunjucks";
import puppeteer from "puppeteer";
import 'dotenv/config';

// Fonction pour générer le PDF
export async function generatePDF(lang, jsonData) {
  // Créer le répertoire de sortie s'il n'existe pas
  const outputDir = './output';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  let outputPdfPath = `./output/cv_${lang}.pdf`;
  // const template = fs.readFileSync("./template/template_en.html", "utf-8");
  // const data = JSON.parse(fs.readFileSync("./example.json", "utf-8"));
  console.log("Génération du PDF...");

  // Lancer Puppeteer
  let browser;
  if (process.env.DOCKER) {
    browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox'],
    });
  } else {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
  }

  const page = await browser.newPage();

  let html = nunjucks.render(`./template/template_${lang}.html`, jsonData);

  // Charger le contenu HTML rendu
  await page.setContent(html, { waitUntil: "networkidle0" });

  // Générer le PDF
  await page.pdf({
    path: outputPdfPath, // Chemin de sortie
    format: "A4", // Format du PDF
  });

  console.log(`PDF généré avec succès : ${outputPdfPath}`);

  // Fermer le navigateur
  await browser.close();
}