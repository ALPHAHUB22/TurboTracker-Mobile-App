import { createNewDirectory, saveImage, addNomedia } from 'src/utils/filesystem.js'
import { boot } from "quasar/wrappers";
import { Preferences } from '@capacitor/preferences';

export default boot(async ({ app }) => {
  const syncStatus = (await Preferences.get({ key: 'syncStatus' })).value
  const localClearedStatus = (await Preferences.get({ key: 'localClearedStatus' })).value
  if (syncStatus === null) await Preferences.set({key: 'syncStatus', value: JSON.stringify(true)})
  if (localClearedStatus === null) await Preferences.set({key: 'localClearedStatus', value: JSON.stringify(true)})
  await createNewDirectory()
  await createNewDirectory("BaseImages")
  await createNewDirectory("Images")
  async function imagePathToBase64(imagePath) {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error reading image:', error);
      return null;
    }
  }

  let imagePath = 'src/assets/images/noimage.jpg';
  imagePathToBase64(imagePath)
  .then(async(base64)=>{
    saveImage(base64, "noimage.jpg", "BaseImages")
    addNomedia("BaseImages")
  })
});
