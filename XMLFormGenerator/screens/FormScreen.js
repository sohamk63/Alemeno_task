import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Alert, TouchableOpacity } from "react-native";
import xml2js from "react-native-xml2js";
import SignatureScreen from "react-native-signature-canvas";

const FormScreen = ({ route }) => {
  const { xmlContent } = route.params;
  const [formFields, setFormFields] = useState([]);
  const inputRefs = useRef({});

  const parseXML = (xmlContent) => {
    const parser = new xml2js.Parser({ explicitArray: false });
    parser.parseString(xmlContent, (err, result) => {
      if (err) {
        console.error("Error parsing XML:", err);
        Alert.alert("Error", "Failed to parse XML.");
        return;
      }

      const parsedFields = extractFields(result);
      setFormFields(parsedFields);
    });
  };

  const extractFields = (node, fields = []) => {
    if (!node) return fields;
  
    // Check if node has attributes and a specific type
    if (node.$ && node.$.fdtType) {
      const rects = node.rect
        ? Array.isArray(node.rect)
          ? node.rect
          : [node.rect]
        : [];
      const texts = node.text
        ? Array.isArray(node.text)
          ? node.text
          : [node.text]
        : [];
  
      // Handle radioList case specifically
      if (node.$.fdtType === "radioList") {
        const rectsWithLabels = rects.map((rect) => {
          // Attempt to find a label for the current rect based on proximity or matching IDs
          const labelTextNode = texts.find(
            (text) =>
              text.$ &&
              rect.$ &&
              (text.$.id?.includes(rect.$.id) || // Match based on ID
                (Math.abs(parseInt(text.$.x, 10) - parseInt(rect.$.x, 10)) < 50 && // Match based on proximity
                  Math.abs(parseInt(text.$.y, 10) - parseInt(rect.$.y, 10)) < 50))
          );
  
          return {
            x: rect.$?.x || 0,
            y: rect.$?.y || 0,
            width: rect.$?.width || 24,
            height: rect.$?.height || 24,
            label: labelTextNode ? labelTextNode.tspan?.["#text"] || "" : "", // Extract label text
          };
        });
  
        fields.push({
          id: node.$.id || "",
          type: node.$.fdtType,
          label: node.$.fdtFieldName || "",
          rects: rectsWithLabels,
        });
      } else {
        // Handle other types (e.g., iso, date, etc.)
        const rectsWithLabels = rects.map((rect, index) => ({
          x: rect.$?.x || 0,
          y: rect.$?.y || 0,
          width: rect.$?.width || 24,
          height: rect.$?.height || 24,
          label: texts[index]?.tspan?.["#text"] || "", // Extract label dynamically
        }));
  
        fields.push({
          id: node.$.id || "",
          type: node.$.fdtType,
          label: node.$.fdtFieldName || "",
          rects: rectsWithLabels,
        });
      }
    }
  
    // Recursively process child nodes
    if (typeof node === "object") {
      Object.values(node).forEach((child) => {
        if (Array.isArray(child)) {
          child.forEach((subChild) => {
            if (subChild && typeof subChild === "object") {
              extractFields(subChild, fields);
            }
          });
        } else if (child && typeof child === "object") {
          extractFields(child, fields);
        }
      });
    }
  
    return fields;
  };
  
  const handleInputChange = (text, fieldId, index) => {
    if (text.length === 1) {
      const nextInput = inputRefs.current[`${fieldId}-${index + 1}`];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleBackspace = (nativeEvent, fieldId, index) => {
    if (nativeEvent.key === "Backspace" && index > 0) {
      const prevInput = inputRefs.current[`${fieldId}-${index - 1}`];
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const renderForm = () => {
    return formFields.map((field) => {
      switch (field.type) {
        case "iso":
          return (
            <View key={field.id} style={{ marginVertical: 10 }}>
              <Text style={{ marginBottom: 5 }}>{field.label}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {field.rects.map((rect, index) => (
                  <TextInput
                    ref={(el) => (inputRefs.current[`${field.id}-${index}`] = el)}
                    key={`${field.id}-rect-${index}`}
                    maxLength={1}
                    style={{
                      width: parseFloat(rect.width) || 19,
                      height: parseFloat(rect.height) || 23,
                      borderWidth: 1,
                      borderColor: "#000",
                      marginHorizontal: 2,
                      marginVertical: 2,
                      textAlign: "center",
                      color: "#000",
                      fontSize: 12,
                      padding: 1,
                    }}
                    onChangeText={(text) =>
                      handleInputChange(text, field.id, index)
                    }
                    onKeyPress={({ nativeEvent }) =>
                      handleBackspace(nativeEvent, field.id, index)
                    }
                  />
                ))}
              </View>
            </View>
          );

        case "date":
          return (
            <View key={field.id} style={{ marginVertical: 10 }}>
              <Text style={{ marginBottom: 5, fontWeight: "bold" }}>{field.label}</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {["D", "D", "/", "M", "M", "/", "Y", "Y", "Y", "Y"].map(
                  (placeholder, index) => {
                    if (placeholder === "/") {
                      // Render separators even if missing in XML
                      return (
                        <Text
                          key={`${field.id}-separator-${index}`}
                          style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            marginHorizontal: 2,
                          }}
                        >
                          {placeholder}
                        </Text>
                      );
                    }
                    const rect = field.rects[index] || {}; // Handle missing rects gracefully
                    return (
                      <TextInput
                        ref={(el) =>
                          (inputRefs.current[`${field.id}-${index}`] = el)
                        }
                        key={`${field.id}-${index}`}
                        maxLength={1}
                        keyboardType="numeric"
                        placeholder={placeholder}
                        placeholderTextColor="red"
                        style={{
                          width: parseFloat(rect.width) || 25,
                          height: parseFloat(rect.height) || 30,
                          borderWidth: 1,
                          borderColor: "#000",
                          marginHorizontal: 2,
                          textAlign: "center",
                          fontSize: 16,
                          padding: 2,
                        }}
                        onChangeText={(text) => {
                          if (text.length === 1) {
                            const nextInput =
                              inputRefs.current[`${field.id}-${index + 1}`];
                            if (nextInput) {
                              nextInput.focus(); // Automatically move to the next input
                            }
                          }
                        }}
                        onKeyPress={({ nativeEvent }) => {
                          if (nativeEvent.key === "Backspace" && index > 0) {
                            const prevInput =
                              inputRefs.current[`${field.id}-${index - 1}`];
                            if (prevInput) {
                              prevInput.focus(); // Automatically move to the previous input
                            }
                          }
                        }}
                      />
                    );
                  }
                )}
              </View>
            </View>
          );

        case "radioList":
          return (
            <View key={field.id} style={{ marginVertical: 10 }}>
              <Text style={{ marginBottom: 5, fontWeight: "bold" }}>
                {field.label}
              </Text>
              {field.rects.map((rect, index) => (
                <TouchableOpacity
                  key={`${field.id}-option-${index}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                  onPress={() => {
                    // Update selected option
                    setFormFields((prevFields) =>
                      prevFields.map((f) =>
                        f.id === field.id
                          ? {
                              ...f,
                              selectedOption: rect.label || `Option ${index + 1}`,
                            }
                          : f
                      )
                    );
                  }}
                >
                  <View
                    style={{
                      width: rect.width,
                      height: rect.height,
                      borderWidth: 1,
                      borderRadius: rect.width / 2, // Make it circular if it's a radio button
                      marginRight: 10,
                      backgroundColor:
                        field.selectedOption === (rect.label || `Option ${index + 1}`)
                          ? "blue"
                          : "white",
                    }}
                  />
                  <Text style={{ fontSize: 14 }}>
                    {rect.label || `Option ${index + 1}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          );

        case "cursiveSignature":
          return (
            <View
              key={field.id}
              style={{
                marginVertical: 10,
                borderWidth: 1,
                borderColor: "#000",
                width: 315,
                height: 135,
              }}
            >
              <Text style={{ marginBottom: 5 }}>{field.label}</Text>
              <SignatureScreen
                onOK={(sig) => console.log(sig)}
                descriptionText="Sign here"
                clearText="Clear"
                confirmText="Save"
                webStyle={`.m-signature-pad {border: none; box-shadow: none;}`}
              />
            </View>
          );

        default:
          return null;
      }
    });
  };

  useEffect(() => {
    parseXML(xmlContent);
  }, [xmlContent]);

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 20 }}>
        Generated Form
      </Text>
      {formFields.length > 0 && renderForm()}
    </ScrollView>
  );
};

export default FormScreen;
