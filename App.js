import { StatusBar } from "expo-status-bar";
import { Button, SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from "react-native";
import { useState, useEffect, useRef } from "react";
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    confirmText: "OK",
    cancelText: "Cancel"
  });

  // Load data when app opens
  useEffect(() => {
    loadTodos();
    loadThemePreference();
  }, []);

  // Load theme preference from AsyncStorage
  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('isDarkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  // Save theme preference to AsyncStorage
  const saveThemePreference = async (darkMode) => {
    try {
      await AsyncStorage.setItem('isDarkMode', JSON.stringify(darkMode));
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    saveThemePreference(newTheme);
  };

  // Custom alert functions
  const showCustomAlert = (title, message, onConfirm, onCancel, confirmText = "OK", cancelText = "Cancel") => {
    setCustomAlert({
      visible: true,
      title,
      message,
      onConfirm,
      onCancel,
      confirmText,
      cancelText
    });
  };

  const hideCustomAlert = () => {
    setCustomAlert({
      visible: false,
      title: "",
      message: "",
      onConfirm: null,
      onCancel: null,
      confirmText: "OK",
      cancelText: "Cancel"
    });
  };

  // Load data from AsyncStorage
  const loadTodos = async () => {
    try {
      const savedTodos = await AsyncStorage.getItem('todos');
      if (savedTodos) {
        setTodos(JSON.parse(savedTodos));
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  // Save data to AsyncStorage
  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = (force = false) => {
    if (force) {
      setIsModalVisible(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
      return;
    }
    // Check if there's any text entered
    if (newTaskTitle.trim() !== "" || newTaskDescription.trim() !== "") {
      showCustomAlert(
        "Discard Task",
        "Are you sure you want to discard this task?",
        () => {
          setIsModalVisible(false);
          setNewTaskTitle("");
          setNewTaskDescription("");
          hideCustomAlert();
        },
        () => hideCustomAlert(),
        "Discard",
        "Cancel"
      );
    } else {
      setIsModalVisible(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditingTask(null);
    setEditTitle("");
    setEditDescription("");
  };

  const updateTask = () => {
    if (editTitle.trim() === "" && editDescription.trim() === "") {
      alert("Please enter a title or description!");
      return;
    }

    const updatedTodos = todos.map(todo => 
      todo.id === editingTask.id 
        ? { ...todo, title: editTitle.trim(), description: editDescription.trim() }
        : todo
    );
    
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
    closeEditModal();
  };

  const deleteTask = () => {
    showCustomAlert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      () => {
        const updatedTodos = todos.filter(todo => todo.id !== editingTask.id);
        setTodos(updatedTodos);
        saveTodos(updatedTodos);
        closeEditModal();
        hideCustomAlert();
      },
      () => hideCustomAlert(),
      "Delete",
      "Cancel"
    );
  };

  const addNewTask = () => {
    if (newTaskTitle.trim() === "" && newTaskDescription.trim() === "") {
      alert("Please enter a task title or description!");
      return;
    }

    const newTask = {
      id: Date.now(), // Benzersiz ID oluştur
      title: newTaskTitle.trim() || "",
      description: newTaskDescription.trim() || null,
      completed: false
    };

    const updatedTodos = [...todos, newTask];
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
    closeModal(true); // force ile çağırınca uyarı çıkmaz
  };

  const saveTodos = async (newTodos) => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(newTodos));
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };

  const toggleTodo = (id) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    saveTodos(updatedTodos); // Save changes
  };

  // Theme colors
  const theme = {
    light: {
      background: "#f8f9fa",
      surface: "#fff",
      primary: "#6366f1",
      text: "#1f2937",
      textSecondary: "#374151",
      textMuted: "#56595fff",
      border: "#e5e7eb",
      shadow: "#000",
      danger: "#ef4444",
      success: "#10b981"
    },
    dark: {
      background: "#1a1a1a",
      surface: "#2d2d2d",
      primary: "#6366f1",
      text: "#f3f4f6",
      textSecondary: "#d1d5db",
      textMuted: "#8b93a3ff",
      border: "#404040",
      shadow: "#000",
      danger: "#f87171",
      success: "#34d399"
    }
  };

  const colors = isDarkMode ? theme.dark : theme.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Theme toggle button - absolute positioned */}
      <TouchableOpacity 
        style={[styles.themeToggleButton, { backgroundColor: colors.surface }]}
        onPress={toggleTheme}
        activeOpacity={0.8}
      >
        <Feather 
          name={isDarkMode ? "moon" : "sun"} 
          size={24} 
          color={colors.primary} 
        />
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={openModal}
        >
          <Text style={styles.buttonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={{paddingBottom: 60}} showsVerticalScrollIndicator={false}>
        {todos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="plus-circle" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              You can add new tasks
            </Text>
          </View>
        ) : (
          todos.map(todo => (
            <TouchableOpacity 
              key={todo.id} 
              style={[styles.taskItem, { 
                backgroundColor: colors.surface,
                shadowColor: colors.shadow
              }]}
              onPress={() => openEditModal(todo)}
              activeOpacity={0.7}
            >
              <TouchableOpacity 
                style={[styles.checkbox, { borderColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleTodo(todo.id);
                }}
              >
                <View style={[
                  styles.innerCheckbox,
                  { backgroundColor: todo.completed ? colors.primary : "transparent" }
                ]} />
              </TouchableOpacity>
              <View style={styles.taskContent}>
                {todo.title.trim() !== "" ? (
                  <Text style={[
                    styles.taskTitle,
                    { color: colors.text },
                    todo.completed && { color: colors.textMuted, textDecorationLine: "line-through" }
                  ]}>
                    {todo.title}
                  </Text>
                ) : null}
                {todo.description && todo.description.trim() !== "" ? (
                  <Text style={[
                    styles.taskDescription,
                    { color: colors.textSecondary },
                    todo.completed && { color: colors.textMuted, textDecorationLine: "line-through" }
                  ]}>
                    {todo.description}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Back icon */}
          <TouchableOpacity style={styles.iconBackButton} onPress={() => closeModal()}>
            <Feather name="arrow-left" size={32} color={colors.primary} />
          </TouchableOpacity>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <TextInput
              style={[styles.modernTitleInput, { 
                backgroundColor: colors.background,
                color: colors.text
              }]}
              placeholder="Title"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={[styles.modernInput, styles.modernDescriptionInput, { 
                backgroundColor: colors.background,
                color: colors.text
              }]}
              placeholder="Description"
              value={newTaskDescription}
              onChangeText={setNewTaskDescription}
              multiline={true}
              numberOfLines={3}
              placeholderTextColor={colors.textMuted}
            />
          </View>
          {/* Modern Save FAB */}
          <TouchableOpacity
            style={[
              styles.fabSaveButton,
              { 
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                opacity: (newTaskTitle.trim() || newTaskDescription.trim()) ? 1 : 0.5 
              }
            ]}
            onPress={addNewTask}
            disabled={!(newTaskTitle.trim() || newTaskDescription.trim())}
            activeOpacity={0.8}
          >
            <Feather name="save" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        onRequestClose={closeEditModal}
        statusBarTranslucent
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Back icon */}
          <TouchableOpacity style={styles.iconBackButton} onPress={closeEditModal}>
            <Feather name="arrow-left" size={32} color={colors.primary} />
          </TouchableOpacity>
          {/* Delete icon */}
          <TouchableOpacity style={styles.iconDeleteButton} onPress={deleteTask}>
            <Feather name="trash-2" size={28} color={colors.danger} />
          </TouchableOpacity>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <TextInput
              style={[styles.modernTitleInput, { 
                backgroundColor: colors.background,
                color: colors.text
              }]}
              placeholder="Title"
              value={editTitle}
              onChangeText={setEditTitle}
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={[styles.modernInput, styles.modernDescriptionInput, { 
                backgroundColor: colors.background,
                color: colors.text
              }]}
              placeholder="Description"
              value={editDescription}
              onChangeText={setEditDescription}
              multiline={true}
              numberOfLines={3}
              placeholderTextColor={colors.textMuted}
            />
          </View>
          {/* Modern Save FAB */}
          <TouchableOpacity
            style={[
              styles.fabSaveButton,
              { 
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                opacity: (editTitle.trim() || editDescription.trim()) ? 1 : 0.5 
              }
            ]}
            onPress={updateTask}
            disabled={!(editTitle.trim() || editDescription.trim())}
            activeOpacity={0.8}
          >
            <Feather name="save" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Custom Alert Modal */}
      <Modal
        visible={customAlert.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideCustomAlert}
      >
        <View style={styles.alertOverlay}>
          <View style={[styles.alertContainer, { 
            backgroundColor: colors.surface,
            borderColor: colors.border
          }]}>
            <Text style={[styles.alertTitle, { color: colors.text }]}>
              {customAlert.title}
            </Text>
            <Text style={[styles.alertMessage, { color: colors.textSecondary }]}>
              {customAlert.message}
            </Text>
            <View style={styles.alertButtons}>
              <TouchableOpacity
                style={[styles.alertButton, styles.alertButtonCancel, { borderColor: colors.border }]}
                onPress={customAlert.onCancel}
                activeOpacity={0.7}
              >
                <Text style={[styles.alertButtonText, { color: colors.textSecondary }]}>
                  {customAlert.cancelText}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertButton, styles.alertButtonConfirm, { backgroundColor: colors.danger }]}
                onPress={customAlert.onConfirm}
                activeOpacity={0.7}
              >
                <Text style={[styles.alertButtonText, { color: "#fff" }]}>
                  {customAlert.confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },

  themeToggleButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 38,
    height: 38,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  buttonContainer: {
    height: 50,
    width:"40%",
    alignSelf: "center",
    marginBottom: 20,
  },
  addButton: {
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  modalContainer: {
    flex: 1,
    paddingTop: 50,
  },
  modalContent: {
    flex: 1,
    padding: 24,
    width: "100%",
    paddingTop: 70,
  },
  modernInput: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    fontSize: 16,
  },
  modernTitleInput: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  modernDescriptionInput: {
    flex: 1,
    textAlignVertical: "top",
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 70,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderRadius: 14,
    marginRight: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  innerCheckbox: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 0,
    overflow: 'hidden',
    borderColor: 'transparent'
  },

  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  taskDescription: {
    fontSize: 15,
    lineHeight: 20,
  },
  iconBackButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabSaveButton: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconDeleteButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 150,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  // Custom Alert Styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 40,
    minWidth: 280,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  alertButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertButtonCancel: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  alertButtonConfirm: {
    backgroundColor: '#ef4444',
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
