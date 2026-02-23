"use client";

import { useState } from "react";

type ProfileFormProps = {
  defaultValues: {
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

  async function onSubmit(formData: FormData) {
    setMessage("Saving...");

    const payload = {
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
