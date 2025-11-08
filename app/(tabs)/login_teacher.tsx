import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput } from 'react-native';


export default function Login(){
  
 const router = useRouter();

 const [teacher_name, setUsername] = useState('');
 const [teacher_password, setPassword] = useState('');
 const [error, setError] = useState('');

 async function loginIntoApp(
   teacher_name:string,
   teacher_password:string
  ){
  if(!teacher_name || !teacher_password ){
    Alert.alert('Error, campos incompletos');
    return;
  }
  setError('');
  try{
      const response = await fetch("http://localhost:3000/verify_teacher", {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
      },
      body: JSON.stringify({
        teacher_name: teacher_name,
        teacher_password: teacher_password
      }),
    });

  console.log("Respuesta del servidor: ", response.status);

  const data = await response.json();
  if(data.success){
    router.navigate('/(tabs)/homepageteacher');
  }
  else
  {
    console.log("el profesor no existe");
  }
  } catch (error:any){
    console.error("Error al buscar profesor");
    setError(error.message);
    Alert.alert(`error, no se pudo verificar al profesor: ${error.message}`);
  }
 }

  return (

    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Log in</ThemedText>
      
      <TextInput 
        placeholder='Insert your username' 
        value={teacher_name}
        onChangeText={setUsername} 
        style={styles.textInputStyle}
        placeholderTextColor="#999"
      />

      <TextInput 
        placeholder='Insert your password'  
        value={teacher_password}
        onChangeText={setPassword} 
        style={styles.textInputStyle}
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <ThemedText 
        onPress={() => router.navigate('/(tabs)/signin')} 
        style={styles.linkText}
      >
        Dont have an account?
      </ThemedText>

      <ThemedText 
        onPress={() => router.navigate('/(tabs)')} 
        style={styles.linkText}
      >
        Are you a student?
      </ThemedText>

      

        <Button 
          title="Login"  
          onPress={() => {
            console.log("El botón fue presionado");
            loginIntoApp(
              teacher_name,
              teacher_password,
            );
          }}
        />
    </ThemedView>
);
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    padding: 20, 
    fontSize: 25,
    textAlign: 'center'
  },
  textInputStyle: {
    color: 'white',
    height: 50,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 5,
  },
  linkText: {
    color: "blue",
    textAlign: 'center',
    marginVertical: 15,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  }
});