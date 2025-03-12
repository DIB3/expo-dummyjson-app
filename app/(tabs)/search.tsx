import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../../constants/theme';
import { useRouter } from 'expo-router'; // Import useRouter for navigation

const Container = styled.View`
    flex: 1;
    background-color: ${theme.colors.background};
    padding: ${theme.spacing.medium}px;
`;

const SearchBar = styled.TextInput`
    background-color: ${theme.colors.card};
    padding: ${theme.spacing.small}px ${theme.spacing.medium}px;
    border-radius: ${theme.borderRadius}px;
    margin-bottom: ${theme.spacing.medium}px;
    font-size: ${theme.fontSizes.medium}px;
`;

const ProductItem = styled.TouchableOpacity`
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

const NoResults = styled.Text`
    font-size: ${theme.fontSizes.medium}px;
    color: ${theme.colors.textSecondary};
    text-align: center;
    margin-top: ${theme.spacing.large}px;
`;

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter(); // Use useRouter for navigation

    // Fetch all products on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('https://dummyjson.com/products');
                const data = await response.json();
                setProducts(data.products);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Filter products based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredProducts([]); // Clear results if search query is empty
            return;
        }

        const lowerCaseQuery = searchQuery.toLowerCase();
        const filtered = products.filter(
            (product) =>
                product.title.toLowerCase().includes(lowerCaseQuery) ||
                product.category.toLowerCase().includes(lowerCaseQuery)
        );
        setFilteredProducts(filtered);
    }, [searchQuery, products]);

    // Handle search input changes
    const handleSearchChange = (text) => {
        setSearchQuery(text);
    };

    // Navigate to product details page
    const navigateToProductDetails = (productId) => {
        router.push(`/product/${productId}`); // Navigate to /product/{id}
    };

    // Render each product item
    const renderProductItem = ({ item }) => (
        <ProductItem onPress={() => navigateToProductDetails(item.id)}> {/* Add onPress handler */}
            <ProductImage source={{ uri: item.thumbnail }} />
            <ProductInfo>
                <Text style={{ fontWeight: 'bold', fontSize: theme.fontSizes.medium }}>
                    {item.title}
                </Text>
                <Text style={{ color: theme.colors.textSecondary }}>Category: {item.category}</Text>
                <Text>Price: ${item.price}</Text>
            </ProductInfo>
        </ProductItem>
    );

    return (
        <Container>
            <br></br>
            {/* Search Bar */}
            <SearchBar
                placeholder="Search by name or category..."
                value={searchQuery}
                onChangeText={handleSearchChange}
                style={styles.searchBar}
            />
    <br></br>

            {/* Loading Indicator */}
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            )}

            {/* Display Results */}
            {!loading && (
                <>
                    {filteredProducts.length > 0 ? (
                        <FlatList
                            data={filteredProducts}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderProductItem}
                            contentContainerStyle={styles.listContainer}
                        />
                    ) : searchQuery.trim() ? ( // Show "No results" message if query exists but no matches
                        <NoResults>No results found for "{searchQuery}".</NoResults>
                    ) : null} {/* Do not show anything if no query */}
                </>
            )}
        </Container>
    );
}

// Styles for additional layout adjustments
const styles = StyleSheet.create({
    searchBar: {
        height: 45,
        borderRadius: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        flexGrow: 1,
    },
});