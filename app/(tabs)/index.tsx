import { View, Text, FlatList, TouchableOpacity, Image, Alert, Modal, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { theme } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Container = styled.View`
    flex: 1;
    background-color: ${theme.colors.background};
    padding: ${theme.spacing.medium}px;
`;

const ProductCard = styled.TouchableOpacity`
    flex-direction: row;
    background-color: ${theme.colors.card};
    padding: ${theme.spacing.medium}px;
    margin-bottom: ${theme.spacing.small}px;
    border-radius: ${theme.borderRadius}px;
    shadow-color: #000;
    shadow-opacity: 0.1;
    shadow-radius: 5px;
    elevation: 2;
    align-items: center;
`;

const ProductImage = styled.Image`
    width: 60px;
    height: 60px;
    border-radius: 8px;
    margin-right: ${theme.spacing.medium}px;
`;

const ProductInfo = styled.View`
    flex: 1;
`;

const AddToCartButton = styled.TouchableOpacity`
    background-color: ${theme.colors.primary};
    padding: 8px 12px;
    border-radius: ${theme.borderRadius}px;
`;

const ButtonText = styled.Text`
    color: white;
    font-weight: bold;
`;

const ProductImageLarge = styled.Image`
    width: 120px;
    height: 120px;
    border-radius: 10px;
    margin-bottom: 10px;
`;


const QuantityContainer = styled.View`
    flex-direction: row;
    align-items: center;
    margin: 10px 0;
`;
const ModalContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
    background-color: white;
    padding: 20px;
    width: 80%;
    border-radius: ${theme.borderRadius}px;
    align-items: center;
`;

const QuantityInput = styled.TextInput`
    border: 1px solid ${theme.colors.primary};
    padding: 8px;
    width: 50px;
    text-align: center;
    margin: 10px;
    font-size: 16px;
    border-radius: ${theme.borderRadius}px;
`;

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
      axios.get(`https://dummyjson.com/products?limit=10&skip=${(page - 1) * 10}`)
          .then(response => setProducts(response.data.products))
          .catch(error => console.error(error));
  }, [page]);

  
  const saveCartToStorage = async (cartItems) => {
      try {
          await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
          console.error('Error saving cart to storage:', error);
      }
  };


  const loadCartFromStorage = async () => {
      try {
          const cartData = await AsyncStorage.getItem('cart');
          if (cartData) {
              return JSON.parse(cartData);
          }
          return [];
      } catch (error) {
          console.error('Error loading cart from storage:', error);
          return [];
      }
  };

  const openAddToCartModal = (product) => {
      setSelectedProduct(product);
      setQuantity(1); 
      setModalVisible(true);
  };


  const confirmAddToCart = async () => {
      if (!selectedProduct) return;


      const cartItems = await loadCartFromStorage();


      const existingItemIndex = cartItems.findIndex(item => item.id === selectedProduct.id);

      if (existingItemIndex !== -1) {

          cartItems[existingItemIndex].quantity += quantity;
      } else {
     
          cartItems.push({ id: selectedProduct.id, title: selectedProduct.title, price: selectedProduct.price, quantity });
      }

   
      await saveCartToStorage(cartItems);

      Alert.alert("Added to Cart", `${selectedProduct.title} (x${quantity}) added!`);
      setModalVisible(false); 
  };

  return (
      <Container>
        <br></br>
        <br></br>
          <FlatList
              data={products}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                  <ProductCard onPress={() => router.push(`/product/${item.id}`)}>
                      <ProductImage source={{ uri: item.thumbnail }} />
                      <ProductInfo>
                          <Text style={{ fontSize: theme.fontSizes.medium, fontWeight: 'bold' }}>{item.title}</Text>
                          <Text>${item.price} | Stock: {item.stock}</Text>
                      </ProductInfo>
                      <AddToCartButton onPress={() => openAddToCartModal(item)}>
                          <ButtonText>Add</ButtonText>
                      </AddToCartButton>
                  </ProductCard>
              )}
          />

       
          <Modal visible={modalVisible} transparent={true} animationType="fade">
              <ModalContainer>
                  <ModalContent>
                      {selectedProduct && (
                          <>
                              <ProductImageLarge source={{ uri: selectedProduct.thumbnail }} />
                              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{selectedProduct.title}</Text>
                              <Text style={{ fontSize: 16, marginVertical: 5 }}>
                                  ${selectedProduct.price * quantity} ({selectedProduct.price} per unit)
                              </Text>

                              <QuantityContainer>
                                  <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                                      <Text style={{ fontSize: 24, padding: 10 }}>-</Text>
                                  </TouchableOpacity>

                                  <QuantityInput
                                      keyboardType="numeric"
                                      value={quantity.toString()}
                                      onChangeText={(text) => setQuantity(Math.max(1, parseInt(text) || 1))}
                                  />
                                    
                                  <TouchableOpacity onPress={() => setQuantity(prevQuantity => Math.min(quantity + 1, selectedProduct.stock))}>
                                      <Text style={{ fontSize: 24, padding: 10 }}>+</Text>
                                  </TouchableOpacity>
                              </QuantityContainer>

                              <TouchableOpacity
                                  style={{
                                      marginTop: 10,
                                      backgroundColor: theme.colors.primary,
                                      padding: 10,
                                      borderRadius: theme.borderRadius,
                                  }}
                                  onPress={confirmAddToCart}
                              >
                                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Confirm</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                  style={{ marginTop: 10, padding: 10 }}
                                  onPress={() => setModalVisible(false)}
                              >
                                  <Text style={{ color: 'red' }}>Cancel</Text>
                              </TouchableOpacity>
                          </>
                      )}
                  </ModalContent>
              </ModalContainer>
          </Modal>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity onPress={() => setPage(page - 1)} disabled={page === 1}>
                  <Text style={{ color: page === 1 ? 'gray' : theme.colors.primary }}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPage(page + 1)}>
                  <Text style={{ color: theme.colors.primary }}>Next</Text>
              </TouchableOpacity>
          </View>
      </Container>
  );
}
