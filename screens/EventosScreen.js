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

const EventosScreen = ({ navigation }) => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventos();
  }, []);

  // Carregar eventos do Firestore
  const loadEventos = async () => {
    try {
      const eventosRef = collection(db, 'eventos');
      const q = query(
        eventosRef,
        where('active', '==', true),
        orderBy('date', 'asc')
      );
      const snapshot = await getDocs(q);
      const eventosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEventos(eventosData);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      // Eventos de exemplo caso não consiga carregar do Firebase
      setEventos([
        {
          id: '1',
          title: 'Culto de Celebração',
          description: 'Venha celebrar conosco neste culto especial de gratidão.',
          date: '2025-01-15',
          time: '19:00',
          location: 'Templo Principal',
          imageUrl: 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Culto+de+Celebração'
        },
        {
          id: '2',
          title: 'Conferência de Jovens',
          description: 'Três dias de adoração, palavra e comunhão para os jovens.',
          date: '2025-01-20',
          time: '18:00',
          location: 'Auditório',
          imageUrl: 'https://via.placeholder.com/300x200/22c55e/ffffff?text=Conferência+Jovens'
        },
        {
          id: '3',
          title: 'Retiro Espiritual',
          description: 'Um fim de semana de renovação espiritual e comunhão.',
          date: '2025-02-01',
          time: '08:00',
          location: 'Sítio da Igreja',
          imageUrl: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Retiro+Espiritual'
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
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Renderizar item de evento
  const renderEvento = ({ item }) => (
    <TouchableOpacity style={styles.eventoCard}>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.eventoImage}
        resizeMode="cover"
      />
      <View style={styles.eventoContent}>
        <Text style={styles.eventoTitle}>{item.title}</Text>
        <Text style={styles.eventoDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.eventoDetails}>
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
        <Text style={styles.headerTitle}>Eventos</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Lista de Eventos */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando eventos...</Text>
        </View>
      ) : eventos.length > 0 ? (
        <FlatList
          data={eventos}
          renderItem={renderEvento}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.eventsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Nenhum evento disponível</Text>
          <Text style={styles.emptySubtext}>
            Novos eventos serão exibidos aqui quando disponíveis.
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
  eventsList: {
    padding: 20,
  },
  eventoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  eventoImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  eventoContent: {
    padding: 20,
  },
  eventoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  eventoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  eventoDetails: {
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

export default EventosScreen;

