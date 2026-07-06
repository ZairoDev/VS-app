import React from "react";
import { View, StyleSheet, Dimensions, StatusBar, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Modalize } from "react-native-modalize";
import { router, useLocalSearchParams, type Route } from "expo-router";
import { booking } from "@/Constants/booking-theme";
import { useReserveScreen } from "@/hooks/useReserveScreen";
import {
  BookingSuccessModal,
  GoodToKnowAccordion,
  GuestPickerSheetContent,
  PriceSummaryCard,
  ReserveErrorState,
  ReserveFooter,
  ReserveHeader,
  ReservePropertyRecap,
  ReserveSkeleton,
  StaySelectorSheetContent,
  TravellerSheet,
  TripDetailsCard,
  CouponSheet,
} from "@/components/booking";

const { height } = Dimensions.get("window");
const { colors: c } = booking;
const SHEET_HEIGHT = Math.round(height * 0.88);

const sheetScrollProps = {
  showsVerticalScrollIndicator: false,
  nestedScrollEnabled: true,
  keyboardShouldPersistTaps: "handled" as const,
  bounces: true,
};

export default function ReservationScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const reserve = useReserveScreen(id);

  return (
    <>
      <BookingSuccessModal
        visible={reserve.successVisible}
        onClose={() => reserve.setSuccessVisible(false)}
        onViewBookings={() => {
          reserve.setSuccessVisible(false);
          router.replace("/(tabs)/Booking");
        }}
      />
      <StatusBar barStyle="dark-content" backgroundColor={c.surface} translucent={false} />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ReserveHeader onBack={() => router.back()} />

        <View style={styles.body}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {reserve.propertyLoading ? (
              <ReserveSkeleton />
            ) : reserve.propertyError ? (
              <ReserveErrorState message={reserve.propertyError} onRetry={reserve.reloadProperty} />
            ) : reserve.property ? (
              <>
                <ReservePropertyRecap
                  property={reserve.property}
                  imageUri={reserve.propertyRecapImage}
                  longTerm={reserve.longTerm}
                  unitPrice={reserve.unitPrice}
                  priceSuffix={reserve.priceSuffix}
                  onPress={() => router.push(`/(screens)/property-info/${id}` as Route)}
                />

                <TripDetailsCard
                  tripMeta={reserve.tripMeta}
                  selectionTitle={reserve.selectionTitle}
                  staySummary={reserve.staySummary}
                  datesSelected={reserve.datesSelected}
                  longTerm={reserve.longTerm}
                  guestSummary={reserve.formatGuestSummary()}
                  guestsAdults={reserve.guests.adults}
                  travellerCount={reserve.travellerCount}
                  onOpenStaySelector={reserve.handleStaySelectorOpen}
                  onOpenGuests={reserve.handleGuestModalOpen}
                  onOpenTravellers={reserve.handleAddTraveller}
                />

                <PriceSummaryCard
                  datesSelected={reserve.datesSelected}
                  longTerm={reserve.longTerm}
                  unitPrice={reserve.unitPrice}
                  billDetails={reserve.billDetails}
                  payableAnimatedValue={reserve.payableAnimatedValue}
                  startDate={reserve.selectedDates.startDate}
                  quotationExpanded={reserve.quotationExpanded}
                  appliedCoupon={reserve.appliedCoupon}
                  onToggleQuotation={() => reserve.setQuotationExpanded((prev) => !prev)}
                  onOpenCoupon={() => reserve.couponModalizeRef.current?.open()}
                />

                <GoodToKnowAccordion
                  property={reserve.property}
                  longTerm={reserve.longTerm}
                  onViewPropertyRules={() => router.push(`/(screens)/property-info/${id}` as Route)}
                />
              </>
            ) : null}
          </ScrollView>

          <ReserveFooter
            datesSelected={reserve.datesSelected}
            payableAnimatedValue={reserve.payableAnimatedValue}
            unitPrice={reserve.unitPrice}
            priceSuffix={reserve.priceSuffix}
            ctaLabel={reserve.reserveCtaLabel}
            isSubmitting={reserve.isSubmitting}
            propertyLoading={reserve.propertyLoading}
            propertyReady={!!reserve.property}
            bottomInset={insets.bottom}
            onCtaPress={reserve.handleReserveCtaPress}
          />
        </View>

        <Modalize
          ref={reserve.modalizeRef}
          modalHeight={SHEET_HEIGHT}
          disableScrollIfPossible={false}
          modalStyle={styles.modalStyle}
          scrollViewProps={{ ...sheetScrollProps, scrollEventThrottle: 16 }}
        >
          <StaySelectorSheetContent
            longTerm={reserve.longTerm}
            unitPrice={reserve.unitPrice}
            monthOptions={reserve.monthOptions}
            durationOptions={reserve.durationOptions}
            tempLongTermStart={reserve.tempLongTermStart}
            tempLongTermDuration={reserve.tempLongTermDuration}
            selectedDates={reserve.selectedDates}
            markedDates={reserve.markedDates}
            calendarMinDate={reserve.calendarConfig.minDate}
            calendarMaxDate={reserve.calendarConfig.maxDate}
            onSelectLongTermStart={reserve.setTempLongTermStart}
            onSelectLongTermDuration={reserve.setTempLongTermDuration}
            onConfirmLongTerm={reserve.handleConfirmLongTermStay}
            onDayPress={reserve.onDayPress}
          />
        </Modalize>

        <Modalize
          ref={reserve.guestModalizeRef}
          modalHeight={SHEET_HEIGHT}
          disableScrollIfPossible={false}
          modalStyle={styles.modalStyle}
          scrollViewProps={sheetScrollProps}
        >
          <GuestPickerSheetContent
            guests={reserve.tempGuests}
            onUpdateGuestCount={reserve.updateGuestCount}
            onConfirm={reserve.handleConfirmGuests}
          />
        </Modalize>

        <Modalize
          ref={reserve.travellerModalizeRef}
          modalHeight={SHEET_HEIGHT}
          handlePosition="inside"
          withHandle={false}
          disableScrollIfPossible={false}
          modalStyle={styles.modalStyle}
          scrollViewProps={sheetScrollProps}
        >
          <TravellerSheet
            bookingId={String(id ?? "")}
            guests={reserve.guests}
            onClose={() => reserve.travellerModalizeRef.current?.close()}
          />
        </Modalize>

        <Modalize
          ref={reserve.couponModalizeRef}
          modalHeight={SHEET_HEIGHT}
          handlePosition="inside"
          withHandle={false}
          disableScrollIfPossible={false}
          modalStyle={styles.modalStyle}
          scrollViewProps={sheetScrollProps}
        >
          <CouponSheet onClose={() => reserve.couponModalizeRef.current?.close()} />
        </Modalize>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: c.surface,
  },
  body: {
    flex: 1,
    backgroundColor: c.bg,
  },
  scrollContent: { padding: 16, paddingBottom: 110, gap: 16 },
  modalStyle: { padding: 20, backgroundColor: c.surface },
});
