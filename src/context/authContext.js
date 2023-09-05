import { createContext, useContext,useEffect,useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword,onAuthStateChanged, signOut,GoogleAuthProvider,signInWithPopup } from "firebase/auth";
import {auth, firestore} from "../firebase";
import { getDoc,setDoc,doc } from "firebase/firestore";

export const authContext =createContext();

export const useAuth =()=>{
    const context =useContext(authContext);
    return context;
}

export function AuthProvider({children}){
    const[user,setUser] = useState(null);
    const[loading,setLoading]= useState(true);

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
        <authContext.Provider value={{login,registro,user,loading,logOut,logInGoogle}}>{children}</authContext.Provider>
    )
        

}

