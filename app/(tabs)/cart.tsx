import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { theme } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const Container = styled.View`
    flex: 1;
    background-color: ${theme.colors.background};
    padding: ${theme.spacing.medium}px;
`;

const CartItem = styled.View`
    flex-direction: row;
    align-items: center;
    background-color: ${theme.colors.card};
    padding: ${theme.spacing.medium}px;
    margin-bottom: ${theme.spacing.small}px;
    border-radius: ${theme.borderRadius}px;
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

const QuantityContainer = styled.View`
    flex-direction: row;
    align-items: center;
`;

const QuantityButton = styled.TouchableOpacity`
    padding: 5px 10px;
    background-color: ${theme.colors.primary};
    border-radius: 5px;
    margin: 0 5px;
`;

const RemoveButton = styled.TouchableOpacity`
    padding: 5px 10px;
    background-color: red;
    border-radius: 5px;
    margin-left: 10px;
`;

const CheckoutButton = styled.TouchableOpacity`
    background-color: green;
    padding: 12px;
    border-radius: ${theme.borderRadius}px;
    align-items: center;
    margin-top: 10px;
`;

const ButtonText = styled.Text`
    color: white;
    font-weight: bold;
`;

export default function CartScreen() {
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused(); 

    // Load cart data from AsyncStorage when the screen mounts
    useEffect(() => {
        const loadCartData = async () => {
            try {
                const cartData = await AsyncStorage.getItem('cart');
                if (cartData) {
                    setCart(JSON.parse(cartData));
                }
            } catch (error) {
                console.error('Error loading cart data:', error);
            }
        };

        loadCartData();
    }, []);

    // Fetch product details for each item in the cart
    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                if (cart.length === 0) {
                    setLoading(false);
                    return;
                }

                const productPromises = cart.map(async (item) => {
                    const response = await fetch(`https://dummyjson.com/products/${item.id}`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch product with ID ${item.id}`);
                    }
                    const product = await response.json();
                    return { ...product, quantity: item.quantity }; // Merge fetched data with quantity
                });

                const fetchedProducts = await Promise.all(productPromises);
                setProducts(fetchedProducts);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching product details:', error);
                setLoading(false);
            }
        };

        if (cart.length > 0) {
            fetchProductDetails();
        } else {
            setLoading(false);
        }
    }, [cart]);

    // Increase quantity of a product
    const increaseQuantity = (id) => {
        setCart(
            cart.map((item) =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    // Decrease quantity of a product
    const decreaseQuantity = (id) => {
        setCart(
            cart.map((item) =>
                item.id === id && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    };

    // Remove a product from the cart
    const removeItem = (id) => {
        setCart(cart.filter((item) => item.id !== id));
    };

    // Calculate total price of all items in the cart
    const calculateTotal = () => {
        return products.reduce((total, product) => total + product.price * product.quantity, 0);
    };

    // Handle checkout process
    const handleCheckout = async () => {
        console.log('Checkout button clicked');
        try {
            // Bypass confirmation for testing
            setCart([]);
            setProducts([]);
            await AsyncStorage.removeItem('cart');
            console.log('Cart data removed from AsyncStorage');
            Alert.alert('Success', 'Your order has been placed successfully!');
        } catch (error) {
            console.error('Error clearing cart data:', error);
            Alert.alert('Error', 'Failed to clear cart data. Please try again.');
        }
    };

    return (
        <Container>
            <Text style={{ fontSize: theme.fontSizes.large, fontWeight: 'bold' }}>My Cart</Text>
            <br></br><br></br>
  
            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : products.length === 0 ? (
                <Text>No items in the cart.</Text>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <CartItem>
                            {item.thumbnail ? (
                                <ProductImage source={{ uri: item.thumbnail }} />
                            ) : (
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                            )}
                            <ProductInfo>
                                <Text style={{ fontSize: theme.fontSizes.medium }}>{item.title}</Text>
                                <Text>${item.price * item.quantity} (${item.price} each)</Text>
                                <QuantityContainer>
                                    <QuantityButton onPress={() => decreaseQuantity(item.id)}>
                                        <Text style={{ color: 'white' }}>-</Text>
                                    </QuantityButton>
                                    <Text>{item.quantity}</Text>
                                    <QuantityButton onPress={() => increaseQuantity(item.id)}>
                                        <Text style={{ color: 'white' }}>+</Text>
                                    </QuantityButton>
                                    <RemoveButton onPress={() => removeItem(item.id)}>
                                        <Text style={{ color: 'white' }}>x</Text>
                                    </RemoveButton>
                                </QuantityContainer>
                            </ProductInfo>
                        </CartItem>
                    )}
                />
            )}
            {products.length > 0 && (
                <>
                    <Text style={{ fontSize: theme.fontSizes.large, fontWeight: 'bold', marginTop: 10 }}>
                        Total: ${calculateTotal().toFixed(2)}
                    </Text>
                    <CheckoutButton onPress={handleCheckout}>
                        <ButtonText>Checkout</ButtonText>
                    </CheckoutButton>
                </>
            )}
        </Container>
    );
}