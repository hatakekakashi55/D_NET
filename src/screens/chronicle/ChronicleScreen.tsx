import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { useUniverseStore } from '../../store/universeStore';
import { Chronicle } from '../../types/universe.types';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY, FONT_SIZES } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';
import { Icon } from '../../components/common/Icon';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Card } from '../../components/common/Card';
import { ChronicleCard } from '../../components/universe/ChronicleCard';

export const ChronicleScreen: React.FC = () => {
  const { chronicles, isLoading, fetchChronicles } = useUniverseStore();
  const [selectedChronicle, setSelectedChronicle] = useState<Chronicle | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchChronicles();
  }, []);

  const handleOpenChronicle = (chronicle: Chronicle) => {
    setSelectedChronicle(chronicle);
    setModalVisible(true);
  };

  if (isLoading && chronicles.length === 0) {
    return <Loader fullScreen message="Weaving collective dream chronicles..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Screen Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dream Chronicles</Text>
          <Text style={styles.subtitle}>Daily stories woven from sleeping minds</Text>
        </View>

        {/* Empty State */}
        {chronicles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="book-open" size={48} color={COLORS.textMuted} style={{ marginBottom: SPACING.md }} />
            <Text style={styles.emptyTitle}>Chronicles are empty</Text>
            <Text style={styles.emptyText}>No stories have been woven yet. Record more dreams to generate daily chronicles.</Text>
          </View>
        ) : (
          <FlatList
            data={chronicles}
            renderItem={({ item }) => (
              <ChronicleCard
                chronicle={item}
                onPress={() => handleOpenChronicle(item)}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Chronicle bottom sheet modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              {selectedChronicle && (
                <Badge
                  label={selectedChronicle.realm_name}
                  color={selectedChronicle.realm_color}
                />
              )}
              
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Icon name="circle-off-outline" size={24} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            {/* Modal Story Content */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedChronicle && (
                <Text style={styles.modalStory}>{selectedChronicle.story}</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  header: {
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 28,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 100, // accommodate bottom tab bar
  },
  emptyContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal Bottom Sheet Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    maxHeight: '60%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  closeBtn: {
    padding: 4,
  },
  modalStory: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
});

export default ChronicleScreen;
