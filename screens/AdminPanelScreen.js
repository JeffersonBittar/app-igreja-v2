import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  FlatList,
  TextInput,
  Modal,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db, storage } from '../firebaseConfig';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  query,
  orderBy 
} from 'firebase/firestore';

const AdminPanelScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('banners');
  const [banners, setBanners] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [cultos, setCultos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    imageUrl: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Carregar dados baseado na aba ativa
  const loadData = async () => {
    try {
      switch (activeTab) {
        case 'banners':
          await loadBanners();
          break;
        case 'eventos':
          await loadEventos();
          break;
        case 'cultos':
          await loadCultos();
          break;
        case 'agenda':
          await loadAgendamentos();
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  // Carregar banners
  const loadBanners = async () => {
    const bannersRef = collection(db, 'banners');
    const snapshot = await getDocs(query(bannersRef, orderBy('createdAt', 'desc')));
    setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // Carregar eventos
  const loadEventos = async () => {
    const eventosRef = collection(db, 'eventos');
    const snapshot = await getDocs(query(eventosRef, orderBy('date', 'desc')));
    setEventos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // Carregar cultos
  const loadCultos = async () => {
    const cultosRef = collection(db, 'cultos');
    const snapshot = await getDocs(query(cultosRef, orderBy('date', 'desc')));
    setCultos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // Carregar agendamentos
  const loadAgendamentos = async () => {
    const agendamentosRef = collection(db, 'appointments');
    const snapshot = await getDocs(query(agendamentosRef, orderBy('date', 'desc')));
    setAgendamentos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // Adicionar item
  const addItem = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'Título é obrigatório');
      return;
    }

    try {
      const collectionName = activeTab === 'banners' ? 'banners' : activeTab;
      const data = {
        ...formData,
        active: true,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, collectionName), data);
      Alert.alert('Sucesso', 'Item adicionado com sucesso!');
      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o item');
    }
  };

  // Editar item
  const editItem = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'Título é obrigatório');
      return;
    }

    try {
      const collectionName = activeTab === 'banners' ? 'banners' : activeTab;
      await updateDoc(doc(db, collectionName, editingItem.id), formData);
      Alert.alert('Sucesso', 'Item atualizado com sucesso!');
      setShowAddModal(false);
      setEditingItem(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao editar item:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o item');
    }
  };

  // Deletar item
  const deleteItem = async (item) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir "${item.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const collectionName = activeTab === 'banners' ? 'banners' : activeTab;
              await deleteDoc(doc(db, collectionName, item.id));
              Alert.alert('Sucesso', 'Item excluído com sucesso!');
              loadData();
            } catch (error) {
              console.error('Erro ao excluir item:', error);
              Alert.alert('Erro', 'Não foi possível excluir o item');
            }
          }
        }
      ]
    );
  };

  // Liberar agendamento
  const liberarAgendamento = async (agendamento) => {
    Alert.alert(
      'Liberar Agendamento',
      `Liberar o agendamento de ${agendamento.userName} para ${agendamento.date} às ${agendamento.time}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Liberar',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'appointments', agendamento.id));
              Alert.alert('Sucesso', 'Agendamento liberado!');
              loadAgendamentos();
            } catch (error) {
              console.error('Erro ao liberar agendamento:', error);
              Alert.alert('Erro', 'Não foi possível liberar o agendamento');
            }
          }
        }
      ]
    );
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      imageUrl: ''
    });
  };

  // Abrir modal para adicionar
  const openAddModal = () => {
    resetForm();
    setEditingItem(null);
    setShowAddModal(true);
  };

  // Abrir modal para editar
  const openEditModal = (item) => {
    setFormData({
      title: item.title || '',
      description: item.description || '',
      date: item.date || '',
      time: item.time || '',
      location: item.location || '',
      imageUrl: item.imageUrl || ''
    });
    setEditingItem(item);
    setShowAddModal(true);
  };

  // Renderizar item da lista
  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      )}
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {item.date && (
          <Text style={styles.itemDate}>
            {item.date} {item.time && `às ${item.time}`}
          </Text>
        )}
        {item.userName && (
          <Text style={styles.itemUser}>
            Agendado por: {item.userName}
          </Text>
        )}
      </View>
      <View style={styles.itemActions}>
        {activeTab === 'agenda' ? (
          <TouchableOpacity
            style={styles.liberarButton}
            onPress={() => liberarAgendamento(item)}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => openEditModal(item)}
            >
              <Ionicons name="pencil" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteItem(item)}
            >
              <Ionicons name="trash" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  // Obter dados da aba ativa
  const getActiveData = () => {
    switch (activeTab) {
      case 'banners': return banners;
      case 'eventos': return eventos;
      case 'cultos': return cultos;
      case 'agenda': return agendamentos;
      default: return [];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Painel de Controle</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['banners', 'eventos', 'cultos', 'agenda'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </Text>
          {activeTab !== 'agenda' && (
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={getActiveData()}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Modal de Adicionar/Editar */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Editar' : 'Adicionar'} {activeTab.slice(0, -1)}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Título"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            {activeTab !== 'banners' && (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descrição"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
              />
            )}

            {activeTab !== 'banners' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Data (YYYY-MM-DD)"
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Horário (HH:MM)"
                  value={formData.time}
                  onChangeText={(text) => setFormData({ ...formData, time: text })}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Local"
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                />
              </>
            )}

            <TextInput
              style={styles.input}
              placeholder="URL da Imagem"
              value={formData.imageUrl}
              onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={editingItem ? editItem : addItem}
              >
                <Text style={styles.confirmButtonText}>
                  {editingItem ? 'Atualizar' : 'Adicionar'}
                </Text>
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
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginRight: 10,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#6366f1',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6366f1',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#6366f1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  itemImage: {
    width: 80,
    height: 80,
  },
  itemContent: {
    flex: 1,
    padding: 15,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
  },
  itemUser: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 15,
  },
  editButton: {
    backgroundColor: '#f59e0b',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liberarButton: {
    backgroundColor: '#22c55e',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
    backgroundColor: '#6366f1',
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

export default AdminPanelScreen;

