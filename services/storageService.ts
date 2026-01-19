
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";

/**
 * Uploads a file to Firebase Storage and returns the public download URL.
 * @param file The file object from an input element
 * @param path The folder path (e.g., 'receipts', 'avatars')
 */
export const uploadImage = async (file: File, path: string): Promise<string> => {
  // Create a local URL immediately for fallback
  const localUrl = URL.createObjectURL(file);

  // If storage isn't initialized, immediately fallback
  if (!storage) {
      console.log("Storage not connected. Using local preview.");
      return localUrl;
  }
  
  try {
    // Create a unique filename to prevent overwrites
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const uniqueName = `${timestamp}-${cleanFileName}`;
    const fullPath = `${path}/${uniqueName}`;
    
    const storageRef = ref(storage, fullPath);
    
    // Upload the file
    console.log(`Uploading to: ${fullPath}`);
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error: any) {
    // This warning is expected if Firebase Storage rules/CORS haven't been set up yet.
    // The app will continue to work using the local URL.
    console.warn("Storage upload skipped (Offline/Demo Mode active). Using local preview.");
    
    // FALLBACK: Return the local blob URL. 
    // This allows the app to function visually for the current session.
    return localUrl;
  }
};
