import { useLocalSearchParams } from 'expo-router';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components/native';
import { theme } from '../../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Container = styled.ScrollView`
    flex: 1;
    background-color: ${theme.colors.background};
    padding: ${theme.spacing.medium}px;
`;

const ProductImage = styled.Image`
    width: 100%;
    height: 250px;
    border-radius: ${theme.borderRadius}px;
    margin-bottom: ${theme.spacing.medium}px;
`;

const Title = styled.Text`
    font-size: ${theme.fontSizes.large}px;
    font-weight: bold;
    margin-bottom: ${theme.spacing.small}px;
`;

const Price = styled.Text`
    font-size: ${theme.fontSizes.medium}px;
    color: green;
    margin-bottom: ${theme.spacing.medium}px;
`;

const Description = styled.Text`
    font-size: ${theme.fontSizes.medium}px;
    color: ${theme.colors.textSecondary};
    margin-bottom: ${theme.spacing.medium}px;
`;

const StockInfo = styled.Text`
    font-size: ${theme.fontSizes.small}px;
    color: ${theme.colors.primary};
    margin-bottom: ${theme.spacing.medium}px;
`;

const QuantityContainer = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: ${theme.spacing.medium}px;
    margin-left: auto;
    margin-right: auto;
`;

const QuantityButton = styled.TouchableOpacity`
    background-color: ${theme.colors.primary};
    padding: ${theme.spacing.small}px ${theme.spacing.medium}px;
    border-radius: ${theme.borderRadius}px;
    margin-right: ${theme.spacing.small}px;
`;

const QuantityText = styled.Text`
    font-size: ${theme.fontSizes.medium}px;
    color: white;
    font-weight: bold;
`;

const AddToCartButton = styled.TouchableOpacity`
    background-color: ${theme.colors.primary};
    padding: ${theme.spacing.medium}px;
    border-radius: ${theme.borderRadius}px;
    align-items: center;
    
`;

const ButtonText = styled.Text`
    color: white;
    font-size: ${theme.fontSizes.medium}px;
    font-weight: bold;
`;

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1); 

   
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`https://dummyjson.com/products/${id}`);
                setProduct(response.data);
            } catch (error) {
                console.error('Error fetching product details:', error);
                Alert.alert('Error', 'Failed to load product details.');
            }
        };

        fetchProduct();
    }, [id]);


    const addToCart = async () => {
        if (!product) return;

        try {
            
            const cartData = await AsyncStorage.getItem('cart');
            let cartItems = cartData ? JSON.parse(cartData) : [];

           
            const existingItemIndex = cartItems.findIndex(item => item.id === product.id);

            if (existingItemIndex !== -1) {
               
                cartItems[existingItemIndex].quantity += quantity;
            } else {
                
                cartItems.push({ ...product, quantity });
            }

           
            await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
            Alert.alert('Success', `${product.title} (x${quantity}) added to cart!`);
        } catch (error) {
            console.error('Error adding product to cart:', error);
            Alert.alert('Error', 'Failed to add product to cart.');
        }
    };

    
    const increaseQuantity = () => {
        setQuantity(prevQuantity => Math.min(prevQuantity + 1, product.stock)); 
    };

    
    const decreaseQuantity = () => {
        setQuantity(prevQuantity => Math.max(prevQuantity - 1, 1)); 
    };

    if (!product) return <Text>Loading...</Text>;

    return (
        <Container>
           
            <ProductImage source={{ uri: product.thumbnail }} />

          
            <Title>{product.title}</Title>

            <Text style={{ color: theme.colors.textSecondary }}>Category: {product.category}</Text>

            <Price>${product.price}</Price>

       
            <Description>{product.description}</Description>

           
            <StockInfo>
                In Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </StockInfo>

          
            <QuantityContainer>
                <QuantityButton onPress={decreaseQuantity}>
                    <QuantityText>-</QuantityText>
                </QuantityButton>
                <Text style={{ fontSize: theme.fontSizes.medium, marginHorizontal: theme.spacing.small }}>
                    {quantity}
                </Text>
                <QuantityButton onPress={increaseQuantity}>
                    <QuantityText>+</QuantityText>
                </QuantityButton>

                
                <AddToCartButton onPress={addToCart}>
                     <ButtonText>Add to Cart</ButtonText>
                </AddToCartButton>

            </QuantityContainer>

           
        </Container>
    );
}