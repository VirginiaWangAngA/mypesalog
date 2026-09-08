import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LogScreen from "./screens/LogScreen";
import DashboardScreen from "./screens/DashboardScreen";

export default function App() {
  const [tab, setTab] = useState("log");

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>PesaLog</Text>
      </View>

      {/* Screen */}
      <View style={styles.screen}>
        {tab === "log" ? <LogScreen /> : <DashboardScreen />}
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab} onPress={() => setTab("log")}>
          <Text style={tab === "log" ? styles.tabActive : styles.tabInactive}>
            📋 Log
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => setTab("dash")}>
          <Text style={tab === "dash" ? styles.tabActive : styles.tabInactive}>
            📊 Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#085041",
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "500" },
  screen: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { color: "#085041", fontWeight: "600", fontSize: 14 },
  tabInactive: { color: "#999", fontSize: 14 },
});
