import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

const CursosScreen = ({ navigation }) => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');

  useEffect(() => {
    loadCursos();
  }, []);

  // Carregar cursos do Firestore
  const loadCursos = async () => {
    try {
      const cursosRef = collection(db, 'cursos');
      const q = query(
        cursosRef,
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const cursosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCursos(cursosData);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      // Cursos de exemplo caso não consiga carregar do Firebase
      setCursos([
        {
          id: '1',
          title: 'Curso de Teologia Básica',
          description: 'Fundamentos da fé cristã e estudos bíblicos essenciais para o crescimento espiritual.',
          duration: '6 meses',
          schedule: 'Sábados - 14h às 17h',
          instructor: 'Pastor João Silva',
          price: 'Gratuito',
          imageUrl: 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Teologia+Básica'
        },
        {
          id: '2',
          title: 'Curso de Liderança Cristã',
          description: 'Desenvolvimento de habilidades de liderança baseadas nos princípios bíblicos.',
          duration: '4 meses',
          schedule: 'Quartas - 19h às 21h',
          instructor: 'Pastora Maria Santos',
          price: 'R$ 150,00',
          imageUrl: 'https://via.placeholder.com/300x200/22c55e/ffffff?text=Liderança+Cristã'
        },
        {
          id: '3',
          title: 'Curso de Música e Adoração',
          description: 'Técnicas musicais e ministério de louvor para servir na igreja.',
          duration: '8 meses',
          schedule: 'Domingos - 16h às 18h',
          instructor: 'Ministro Carlos Oliveira',
          price: 'R$ 200,00',
          imageUrl: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Música+e+Adoração'
        },
        {
          id: '4',
          title: 'Curso de Evangelismo',
          description: 'Métodos práticos de evangelização e testemunho cristão.',
          duration: '3 meses',
          schedule: 'Sextas - 19h30 às 21h30',
          instructor: 'Pastor Pedro Costa',
          price: 'Gratuito',
          imageUrl: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Evangelismo'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar interesse no curso
  const showInterest = (curso) => {
    setSelectedCurso(curso);
    setShowInterestModal(true);
  };

  // Enviar interesse para Google Drive
  const submitInterest = async () => {
    if (!userName.trim() || !userPhone.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      // Aqui você implementaria a integração com Google Drive API
      // Por enquanto, vamos simular o envio
      
      const interestData = {
        curso: selectedCurso.title,
        nome: userName,
        telefone: userPhone,
        data: new Date().toISOString(),
        timestamp: new Date().toLocaleString('pt-BR')
      };

      // Simular envio para Google Drive
      console.log('Dados de interesse enviados:', interestData);
      
      Alert.alert(
        'Interesse Registrado!',
        `Seu interesse no curso "${selectedCurso.title}" foi registrado. Entraremos em contato em breve.`
      );

      // Limpar formulário e fechar modal
      setUserName('');
      setUserPhone('');
      setShowInterestModal(false);
      setSelectedCurso(null);

    } catch (error) {
      console.error('Erro ao enviar interesse:', error);
      Alert.alert('Erro', 'Não foi possível registrar seu interesse. Tente novamente.');
    }
  };

  // Renderizar item de curso
  const renderCurso = ({ item }) => (
    <View style={styles.cursoCard}>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.cursoImage}
        resizeMode="cover"
      />
      <View style={styles.cursoContent}>
        <Text style={styles.cursoTitle}>{item.title}</Text>
        <Text style={styles.cursoDescription} numberOfLines={3}>
          {item.description}
        </Text>
        
        <View style={styles.cursoDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.duration}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.schedule}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.instructor}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={16} color="#666" />
            <Text style={[styles.detailText, styles.priceText]}>{item.price}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.interestButton}
          onPress={() => showInterest(item)}
        >
          <Text style={styles.interestButtonText}>Tenho Interesse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cursos</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Lista de Cursos */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando cursos...</Text>
        </View>
      ) : cursos.length > 0 ? (
        <FlatList
          data={cursos}
          renderItem={renderCurso}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.cursosList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="school-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Nenhum curso disponível</Text>
          <Text style={styles.emptySubtext}>
            Novos cursos serão exibidos aqui quando disponíveis.
          </Text>
        </View>
      )}

      {/* Modal de Interesse */}
      <Modal
        visible={showInterestModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Demonstrar Interesse</Text>
            <Text style={styles.modalSubtitle}>
              {selectedCurso?.title}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Seu nome completo"
              value={userName}
              onChangeText={setUserName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Seu telefone"
              value={userPhone}
              onChangeText={setUserPhone}
              keyboardType="phone-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowInterestModal(false);
                  setUserName('');
                  setUserPhone('');
                  setSelectedCurso(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={submitInterest}
              >
                <Text style={styles.confirmButtonText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  cursosList: {
    padding: 20,
  },
  cursoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cursoImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  cursoContent: {
    padding: 20,
  },
  cursoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cursoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  cursoDetails: {
    marginBottom: 20,
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
  priceText: {
    fontWeight: 'bold',
    color: '#22c55e',
  },
  interestButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  interestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  confirmButton: {
    backgroundColor: '#8b5cf6',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CursosScreen;

