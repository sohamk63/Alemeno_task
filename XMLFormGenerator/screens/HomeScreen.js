import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

const HomeScreen = ({ navigation }) => {
  const [xmlInputVisible, setXmlInputVisible] = useState(false);
  const [xmlContent, setXmlContent] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  const pickDocument = async () => {
    if (xmlInputVisible) {
      Alert.alert(
        "Action Blocked",
        "Switch to file picker by disabling text input first."
      );
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.type === "cancel") {
        Alert.alert("No file selected");
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);

      setXmlContent(fileContent);
      setSelectedFileName(result.assets[0].name); // Display file name
      Alert.alert("Document Loaded", "Click 'Create XML Form' to proceed.");
    } catch (error) {
      console.error("Error reading file:", error);
      Alert.alert("Error", "Something went wrong while processing the file.");
    }
  };

  const handleXmlInputToggle = () => {
    if (selectedFileName) {
      Alert.alert(
        "Action Blocked",
        "Switch to text input by clearing the selected file first."
      );
      return;
    }
    setXmlInputVisible(!xmlInputVisible);
    setXmlContent(""); // Reset content when toggling input method
  };

  const clearSelectedFile = () => {
    setSelectedFileName("");
    setXmlContent("");
  };

  const clearInputs = () => {
    setXmlContent("");
    setSelectedFileName("");
    setXmlInputVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>XML Form Generator</Text>
      <Text style={styles.subtitle}>
        Choose a method to provide your XML input.
      </Text>

      {/* File Picker Section */}
      {!xmlInputVisible && (
        <View>
          <TouchableOpacity style={styles.inputButton} onPress={pickDocument}>
            <Text style={styles.inputButtonText}>Click to Select Document</Text>
          </TouchableOpacity>
          {selectedFileName !== "" && (
            <View style={styles.fileDisplay}>
              <Text style={styles.fileName}>Selected File: {selectedFileName}</Text>
              <TouchableOpacity onPress={clearSelectedFile}>
                <Text style={styles.crossSign}>×</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* XML Input Section */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.inputButton} onPress={handleXmlInputToggle}>
          <Text style={styles.inputButtonText}>Input XML Directly</Text>
        </TouchableOpacity>
        {xmlInputVisible && (
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="Paste your XML here"
            placeholderTextColor="#888"
            value={xmlContent}
            onChangeText={(text) => setXmlContent(text)}
          />
        )}
      </View>

      {/* Create XML Form Button */}
      <View style={styles.createButtonContainer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            if (!xmlContent) {
              Alert.alert("No XML Content", "Please select a file or input XML.");
              return;
            }
            navigation.navigate("FormScreen", { xmlContent });
            clearInputs();
          }}
        >
          <Text style={styles.createButtonText}>Create XML Form</Text>
        </TouchableOpacity>
      </View>

      {/* Note Section */}
      <View style={styles.noteContainer}>
        <Text style={styles.noteTitle}>Supported XML Structure:</Text>
        <Text style={styles.noteText}>
          Your XML file should follow a structure similar to this:
        </Text>
        <Text style={styles.codeBlock}>
          &lt;g id="group1" fdtType="iso" fdtFieldName="Username"&gt;{'\n'}
          &nbsp;&nbsp;&lt;rect x="50" y="50" width="20" height="30" /&gt;{'\n'}
          &nbsp;&nbsp;&lt;rect x="70" y="50" width="20" height="30" /&gt;{'\n'}
          &lt;/g&gt;{'\n'}
          &lt;g id="radioGroup" fdtType="radioList" fdtFieldName="Options"&gt;{'\n'}
          &nbsp;&nbsp;&lt;rect id="option1" x="50" y="50" width="20" height="20" /&gt;{'\n'}
          &nbsp;&nbsp;&lt;text id="label1" x="80" y="60"&gt;Option 1&lt;/text&gt;{'\n'}
          &nbsp;&nbsp;&lt;rect id="option2" x="50" y="80" width="20" height="20" /&gt;{'\n'}
          &nbsp;&nbsp;&lt;text id="label2" x="80" y="90"&gt;Option 2&lt;/text&gt;{'\n'}
          &lt;/g&gt;
        </Text>
        <Text style={styles.noteText}>
          Supported form types include:
        </Text>
        <Text style={styles.bullet}>
          • <Text style={styles.bold}>iso:</Text> For text fields where individual characters can be entered in predefined boxes.
        </Text>
        <Text style={styles.bullet}>
          • <Text style={styles.bold}>radioList:</Text> For radio buttons. Each button must have a corresponding label as a <Text style={styles.bold}>&lt;text&gt;</Text> element.
        </Text>
        <Text style={styles.bullet}>
          • <Text style={styles.bold}>date:</Text> For date fields in formats like <Text style={styles.bold}>DD/MM/YYYY</Text>. Ensure separators ("/") are included.
        </Text>
        <Text style={styles.bullet}>
          • <Text style={styles.bold}>cursiveSignature:</Text> For signature fields where users can draw their signature.
        </Text>
        <Text style={styles.noteText}>
          <Text style={styles.bold}>Note:</Text> Ensure that all <Text style={styles.bold}>&lt;rect&gt;</Text> elements for a single form field (e.g., a text input or radio group) are grouped inside a <Text style={styles.bold}>&lt;g&gt;</Text> tag. Labels for radio buttons should be provided as <Text style={styles.bold}>&lt;text&gt;</Text> elements within the same group or closely following it.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F2F3F5", // Soft light gray background
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: "#1C1C1E", // Dark Apple gray
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6E6E73", // Medium Apple gray
    marginBottom: 20,
    textAlign: "center",
  },
  fileDisplay: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  fileName: {
    flex: 1,
    marginRight: 10,
    color: "#1C1C1E",
    fontSize: 14,
    fontWeight: "500",
  },
  crossSign: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF3B30", // Apple red for delete actions
  },
  inputContainer: {
    marginTop: 20,
  },
  textArea: {
    height: 150,
    borderWidth: 1,
    borderColor: "#D1D1D6",
    marginTop: 10,
    padding: 15,
    textAlignVertical: "top",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    fontSize: 16,
    color: "#1C1C1E",
    lineHeight: 22,
  },
  inputButton: {
    backgroundColor: "#D6D6D6", // Light gray for Apple's button style
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  inputButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E", // Dark Apple gray
  },
  createButtonContainer: {
    marginTop: 30,
  },
  createButton: {
    backgroundColor: "#007AFF", // Apple's signature blue
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  noteContainer: {
    marginTop: 40,
    padding: 20,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#1C1C1E",
  },
  noteText: {
    fontSize: 14,
    color: "#6E6E73",
    marginBottom: 10,
    lineHeight: 20,
  },
  codeBlock: {
    backgroundColor: "#F4F4F7",
    padding: 15,
    borderRadius: 10,
    fontSize: 13,
    color: "#1C1C1E",
    marginTop: 10,
  },
});

export default HomeScreen;
