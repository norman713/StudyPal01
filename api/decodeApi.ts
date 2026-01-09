// src/api/qrApi.ts
import { Platform } from "react-native";
import { readTokens } from "./tokenStore";

export interface DecodeQRResponse {
  teamCode: string;
}

export async function decodeQRFromImage(image: {
  uri: string;
  fileName?: string;
  mimeType?: string;
}): Promise<DecodeQRResponse> {
  const formData = new FormData();

  const fileName = image.fileName ?? "qr.jpg";
  const fileType = image.mimeType ?? "image/jpeg";

  if (Platform.OS === "web") {
    const res = await fetch(image.uri);
    const blob = await res.blob();
    formData.append("file", blob, fileName);
  } else {
    formData.append("file", {
      uri: image.uri,
      name: fileName,
      type: fileType,
    } as any);
  }

  const { accessToken } = await readTokens();

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/teams/qr`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        // ❌ KHÔNG set Content-Type
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Decode QR failed: ${response.status} ${text}`);
  }

  return response.json();
}
