"use client";

import { useRef, useState } from "react";

type ProfileFormProps = {
  defaultValues: {
    image?: string;
    birthday?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
};

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [message, setMessage] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | undefined>(defaultValues.image);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Could not read image file."));
      reader.readAsDataURL(file);
    });
  }

  async function resizeImage(dataUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const size = 512;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas is not available."));
          return;
        }

        const crop = Math.min(img.width, img.height);
        const sx = Math.floor((img.width - crop) / 2);
        const sy = Math.floor((img.height - crop) / 2);

        context.drawImage(img, sx, sy, crop, crop, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.onerror = () => reject(new Error("Invalid image file."));
      img.src = dataUrl;
    });
  }

  async function processFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setMessage("Please upload an image file.");
      return;
    }

    setMessage("Processing photo...");
    try {
      const raw = await fileToDataUrl(file);
      const resized = await resizeImage(raw);
      setProfileImage(resized);
      setMessage("Photo ready. Click Save profile.");
    } catch {
      setMessage("Unable to process photo.");
    }
  }

  async function onSubmit(formData: FormData) {
    setMessage("Saving...");

    const payload = {
      image: profileImage,
      birthday: String(formData.get("birthday") ?? "") || undefined,
      addressLine1: String(formData.get("addressLine1") ?? ""),
      addressLine2: String(formData.get("addressLine2") ?? "") || undefined,
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      country: String(formData.get("country") ?? "")
    };

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setMessage(res.ok ? "Profile saved." : "Unable to save profile.");
  }

  return (
    <form action={onSubmit}>
      <div className="profile-photo-wrap">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="profile-photo-input"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void processFile(file);
            }
          }}
        />
        <button
          type="button"
          className={`profile-photo-trigger ${isDragOver ? "drag-over" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragOver(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragOver(false);
            const file = event.dataTransfer.files?.[0];
            if (file) {
              void processFile(file);
            }
          }}
          aria-label="Upload profile photo"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profileImage ?? "/profile-pack/Phibi.png"} alt="Current profile photo" className="profile-photo-preview" />
        </button>
        <p className="muted">Click the photo or drag and drop from your PC.</p>
      </div>
      <label htmlFor="birthday">Birthday</label>
      <input id="birthday" name="birthday" type="date" defaultValue={defaultValues.birthday} />
      <label htmlFor="addressLine1">Address line 1</label>
      <input id="addressLine1" name="addressLine1" required defaultValue={defaultValues.addressLine1} />
      <label htmlFor="addressLine2">Address line 2</label>
      <input id="addressLine2" name="addressLine2" defaultValue={defaultValues.addressLine2} />
      <label htmlFor="city">City</label>
      <input id="city" name="city" required defaultValue={defaultValues.city} />
      <label htmlFor="state">State</label>
      <input id="state" name="state" required defaultValue={defaultValues.state} />
      <label htmlFor="postalCode">Postal code</label>
      <input id="postalCode" name="postalCode" required defaultValue={defaultValues.postalCode} />
      <label htmlFor="country">Country</label>
      <input id="country" name="country" required defaultValue={defaultValues.country ?? "USA"} />
      <button type="submit">Save profile</button>
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}
