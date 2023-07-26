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

        const docuRef = doc(firestore,`users/${email}`);
        setDoc(docuRef,{ isAdmin})
    }

    const login =(email,password)=>{
        return signInWithEmailAndPassword(auth,email,password)
    }

    const logOut =()=> signOut(auth);

    async function getRol(uid) {
        const docuRef = doc(firestore, `users/${uid}`);
        const docuCifrada = await getDoc(docuRef);
        const infoFinal = docuCifrada.data().rol;
        console.log(infoFinal);
        return infoFinal;
      }

    async function logInGoogle(){
        const googleProvider = new GoogleAuthProvider();
        const infoUser = await signInWithPopup(auth, googleProvider).then((infoUser)=>{
            return infoUser;
        });

        const docuRef = doc(firestore,`users/${infoUser.user.email}`);
        setDoc(docuRef,{Correo:infoUser.user.email, isAdmin:false})
    }
    
      function setUserWithFirebaseAndRol(usuarioFirebase) {
        getRol(usuarioFirebase.uid).then((rol) => {
          const userData = {
            uid: usuarioFirebase.uid,
            email: usuarioFirebase.email,
            rol: rol,
          };
          setUser(userData);
          console.log("userData final", userData);
        });
      }

    useEffect(() => {
        const unsubuscribe = onAuthStateChanged(auth, (currentUser) => {
          console.log({ currentUser });
          setUser(currentUser);
          setLoading(false);
        });
        return () => unsubuscribe();
      }, 
      () => {
        const injectRol = onAuthStateChanged(auth, (usuarioFirebase) => {
          if (usuarioFirebase) {
            //funcion final
      
            if (!user) {
              setUserWithFirebaseAndRol(usuarioFirebase);
            }
          } else {
            setUser(null);
          }
        });
        return () => injectRol();
      },
      []);

    return(
        <authContext.Provider value={{login,registro,user,loading,logOut,logInGoogle}}>{children}</authContext.Provider>
    )
        

}

