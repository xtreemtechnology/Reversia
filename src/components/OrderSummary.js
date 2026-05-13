// src/components/OrderSummary.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OrderSummary() {
  const recentOrders = [
    {
      id: 'ORD-1234',
      product: 'Smart Glucometer Pro',
      status: 'Delivered',
      date: 'Dec 15, 2024',
      statusColor: '#10b981',
    },
    {
      id: 'ORD-1235',
      product: 'Test Strips (50ct)',
      status: 'In Transit',
      date: 'Dec 18, 2024',
      statusColor: '#f59e0b',
    },
  ];
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Orders</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {recentOrders.map((order) => (
        <TouchableOpacity key={order.id} style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>{order.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: order.statusColor + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: order.statusColor }]} />
              <Text style={[styles.statusText, { color: order.statusColor }]}>{order.status}</Text>
            </View>
          </View>
          
          <Text style={styles.productName}>{order.product}</Text>
          <Text style={styles.orderDate}>{order.date}</Text>
          
          <TouchableOpacity style={styles.trackButton}>
            <Text style={styles.trackButtonText}>Track Order</Text>
            <Ionicons name="map-outline" size={16} color="#6366f1" />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#eef2ff',
    paddingVertical: 10,
    borderRadius: 12,
  },
  trackButtonText: {
    color: '#6366f1',
    fontWeight: '600',
    fontSize: 14,
  },
});