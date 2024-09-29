import PocketBase from 'pocketbase';
import { EventSource } from 'eventsource';
import dotenv from 'dotenv';
import { generatePDF } from './generatePDF.js';
import fs from "fs";
import path from "path";
dotenv.config();

global.EventSource = EventSource;

const pb = new PocketBase(process.env.POCKETBASE_CLIENT_URL);

const userData = await pb.collection('users').authWithPassword(process.env.POCKETBASE_EMAIL, process.env.POCKETBASE_PASSWORD);

console.log("AutoCV Started...\n");
pb.collection('AutoCv').subscribe('*', async function (e) {
  if(e.action === 'update') {
    let lang = e.record.lang;
    let jsonData = e.record.json;
    console.log("> CV in \""+lang+"\" updated.");

    await generatePDF(lang, jsonData);

    let recordId = lang === 'fr' ? process.env.POCKETBASE_FR_PDF_ID : process.env.POCKETBASE_EN_PDF_ID;

    const record = await pb.collection('CV').update(recordId, {
      "PDF": new Blob([fs.readFileSync(`./output/cv_${lang}.pdf`)], { type: 'application/pdf' })
    });

    console.log("> PDF updated in PocketBase.\n");

    clearFiles();
  }
});

function clearFiles() {
  const directory = ['./output','img'];

  directory.forEach(dir => {
    fs.readdir(dir, (err, files) => {
      if (err) throw err;
    
      for (const file of files) {
        fs.unlink(path.join(dir, file), err => {
          if (err) throw err;
        });
      }
    });
  });
}