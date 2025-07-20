import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const exportToZip = async (files) => {
  const zip = new JSZip();
  
  // Add all files to the zip
  files.forEach((fileData, filePath) => {
    zip.file(filePath, fileData.content);
  });
  
  // Generate the zip file
  const content = await zip.generateAsync({ type: 'blob' });
  
  // Download the file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  saveAs(content, `collaborative-project-${timestamp}.zip`);
};

export const importFromZip = async (file) => {
  return new Promise((resolve, reject) => {
    const zip = new JSZip();
    
    zip.loadAsync(file)
      .then(() => {
        const files = new Map();
        const promises = [];
        
        zip.forEach((relativePath, zipEntry) => {
          if (!zipEntry.dir) {
            const promise = zipEntry.async('string').then(content => {
              files.set(relativePath, { content, type: 'text' });
            });
            promises.push(promise);
          }
        });
        
        Promise.all(promises).then(() => {
          resolve(files);
        });
      })
      .catch(reject);
  });
}; 