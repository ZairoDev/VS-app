import React from "react";
import { WebView } from "react-native-webview";

const PaymentWebViewScreen = ({ route }) => {
  const { orderId, amount, bookingId } = route.params;

  return (
    <WebView
      source={{
        uri: `https://razorpaypayments.vercel.app//payment.html?orderId=${orderId}&amount=${amount}&bookingId=${bookingId}`
      }}
      javaScriptEnabled
    />
  );
};

export default PaymentWebViewScreen;
