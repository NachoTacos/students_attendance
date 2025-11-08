import { StyleSheet } from 'react-native';
import { ThemedView } from "../ThemedView";
import ParallaxScrollView from '../ParallaxScrollView';
import {Image,Button,ScrollView, Text} from 'react-native';


export default function Materia(){
    return(
        <ThemedView style ={styles.titleContainer}>
        <Button title='Ma'/>
        </ThemedView> 
      
    );
}


const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});