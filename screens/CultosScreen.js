import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

const CultosScreen = ({ navigation }) => {
  const [cultos, setCultos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCultos();
  }, []);

  // Carregar cultos do Firestore
  const loadCultos = async () => {
    try {
      const cultosRef = collection(db, 'cultos');
      const q = query(
        cultosRef,
        where('active', '==', true),
        orderBy('date', 'asc')
      );
      const snapshot = await getDocs(q);
      const cultosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCultos(cultosData);
    } catch (error) {
      console.error('Erro ao carregar cultos:', error);
      // Cultos de exemplo caso não consiga carregar do Firebase
      setCultos([
        {
          id: '1',
          title: 'Culto Dominical',
          description: 'Culto de adoração e palavra todos os domingos.',
          date: '2025-01-12',
          time: '09:00',
          location: 'Templo Principal',
          type: 'Dominical',
          imageUrl: 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Culto+Dominical'
        },
        {
          id: '2',
          title: 'Culto de Oração',
          description: 'Momento especial de oração e intercessão.',
          date: '2025-01-14',
          time: '19:30',
          location: 'Templo Principal',
          type: 'Oração',
          imageUrl: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Culto+de+Oração'
        },
        {
          id: '3',
          title: 'Culto de Jovens',
          description: 'Culto especial para a juventude com louvor e palavra.',
          date: '2025-01-17',
          time: '19:00',
          location: 'Auditório',
          type: 'Jovens',
          imageUrl: 'https://via.placeholder.com/300x200/22c55e/ffffff?text=Culto+Jovens'
        },
        {
          id: '4',
          title: 'Culto de Doutrina',
          description: 'Estudo bíblico e ensino doutrinário.',
          date: '2025-01-19',
          time: '19:30',
          location: 'Templo Principal',
          type: 'Doutrina',
          imageUrl: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Culto+Doutrina'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Obter cor do tipo de culto
  const getTypeColor = (type) => {
    const colors = {
      'Dominical': '#6366f1',
      'Oração': '#8b5cf6',
      'Jovens': '#22c55e',
      'Doutrina': '#f59e0b',
      'Especial': '#ef4444'
    };
    return colors[type] || '#6b7280';
  };

  // Renderizar item de culto
  const renderCulto = ({ item }) => (
    <TouchableOpacity style={styles.cultoCard}>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.cultoImage}
        resizeMode="cover"
      />
      <View style={styles.cultoContent}>
        <View style={styles.cultoHeader}>
          <Text style={styles.cultoTitle}>{item.title}</Text>
          <View style={[styles.typeTag, { backgroundColor: getTypeColor(item.type) }]}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>
        
        <Text style={styles.cultoDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.cultoDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{formatDate(item.date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cultos</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Lista de Cultos */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando cultos...</Text>
        </View>
      ) : cultos.length > 0 ? (
        <FlatList
          data={cultos}
          renderItem={renderCulto}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.cultosList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Nenhum culto programado</Text>
          <Text style={styles.emptySubtext}>
            Novos cultos serão exibidos aqui quando programados.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cultosList: {
    padding: 20,
  },
  cultoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cultoImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  cultoContent: {
    padding: 20,
  },
  cultoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cultoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cultoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  cultoDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CultosScreen;

