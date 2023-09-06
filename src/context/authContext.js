import { createContext, useContext,useEffect,useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword,onAuthStateChanged, signOut,GoogleAuthProvider,signInWithPopup } from "firebase/auth";
import {auth, firestore,storage} from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc,collection,getDoc,setDoc,doc } from "firebase/firestore";

export const authContext =createContext();

export const useAuth =()=>{
    const context =useContext(authContext);
    return context;
}

export function AuthProvider({children}){
    const[user,setUser] = useState(null);
    const[loading,setLoading]= useState(true);

    async function newProduct(productData) {
      try {
        // Sube las imágenes a Firebase Storage
        console.log(productData.id)
        const imageRef = ref(storage, `/${productData.id}-image.png`);
        const img1Ref = ref(storage, `/${productData.id}-img1.png`);
        const img2Ref = ref(storage, `/${productData.id}-img2.png`);
        const img3Ref = ref(storage, `/${productData.id}-img3.png`);
  
        const imageUploadTask = uploadBytes(imageRef, productData.image);
        const img1UploadTask = uploadBytes(img1Ref, productData.img1);
        const img2UploadTask = uploadBytes(img2Ref, productData.img2);
        const img3UploadTask = uploadBytes(img3Ref, productData.img3);
  
        // Espera a que todas las imágenes se suban correctamente
        await Promise.all([imageUploadTask, img1UploadTask, img2UploadTask, img3UploadTask]);
  
        // Obtiene las URL de descarga de las imágenes
        const imageURL = await getDownloadURL(imageRef);
        const img1URL = await getDownloadURL(img1Ref);
        const img2URL = await getDownloadURL(img2Ref);
        const img3URL = await getDownloadURL(img3Ref);

        const productRef = doc(firestore,`products/${productData.id}`);
        const docSnap = await getDoc(productRef);
        //Verificar si el usuario existe antes de crearlo
        if(!docSnap.exists()){
          setDoc(productRef,{ 
            title: productData.title,
            category: productData.category,
            cantidad: Number(productData.cantidad),
            enUso: Number(productData.enUso),
            enStock: Number(productData.enStock),
            id: Number(productData.id),
            price: Number(productData.price),
            size: Number(productData.size),
            image: imageURL,
            img1: img1URL,
            img2: img2URL,
            img3: img3URL,
          })
        }
  
        console.log("Producto agregado con ID: ", productRef.id);
        return true;
      } catch (error) {
        console.error("Error al agregar el producto: ", error);
        return false;
      }
    }

    async function registro(email,password,isAdmin=false){
        const infoUser = await createUserWithEmailAndPassword(auth,email,password).then((infoUser)=>{
            return infoUser;
        });

        const docuRef = doc(firestore,`users/${infoUser.user.email}`);
        const docSnap = await getDoc(docuRef);
        //Verificar si el usuario existe antes de crearlo
        if(!docSnap.exists()){
          setDoc(docuRef,{ isAdmin, password:password, uid:infoUser.user.uid})
        }
        
    }

    const login =(email,password)=>{
        return signInWithEmailAndPassword(auth,email,password)
    }

    const logOut =()=> signOut(auth);

    

    async function logInGoogle(){
        const googleProvider = new GoogleAuthProvider();
        const infoUser = await signInWithPopup(auth, googleProvider).then((infoUser)=>{
            return infoUser;
        });

        const docuRef = doc(firestore,`users/${infoUser.user.email}`);
        const docSnap = await getDoc(docuRef);
        //Verificar si el usuario existe antes de crearlo
        if(!docSnap.exists()){
          setDoc(docuRef,{ isAdmin:false, uid:infoUser.user.uid})
        }
    }


      useEffect(() => {
        const unsubuscribe = onAuthStateChanged(auth, async (currentUser) => {
          console.log({ currentUser });
          setUser(currentUser);
      
          if (currentUser) {
            // Verifica si el usuario actual tiene el rol de administrador en la base de datos
            const docuRef = doc(firestore, `users/${currentUser.email}`);
            const docSnap = await getDoc(docuRef);
            if (docSnap.exists()) {
              const userData = docSnap.data();
              console.log(userData)
              currentUser.isAdmin = userData.isAdmin || false;
            }
          }
          setUser(currentUser);
          setLoading(false);
          console.log(currentUser)
        });
      
        return () => unsubuscribe();
      }, []);

    return(
        <authContext.Provider value={{login,registro,user,loading,logOut,logInGoogle, newProduct}}>{children}</authContext.Provider>
    )
        

}

