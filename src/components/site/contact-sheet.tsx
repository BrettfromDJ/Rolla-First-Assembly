"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/sheet";
import { Field, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { church, staffById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { isEmail, isPhone } from "@/lib/utils";

export function ContactSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { profile } = useStore();
  const jamie = staffById.jamie;
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(profile.firstName);
      setContact(profile.email || profile.phone);
      setError(null);
    }
  }, [open, profile.firstName, profile.email, profile.phone]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return setError("Write a quick note so Jamie knows how to help.");
    if (!isEmail(contact) && !isPhone(contact)) return setError("Add an email or phone number so we can reply.");
    onOpenChange(false);
    setMessage("");
    toast("Message sent to Jamie", { description: "Simulated for this prototype. Nothing was actually sent." });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Ask us anything" hideTitle>
      <form onSubmit={submit} className="space-y-6 px-6 pb-8 pt-8 sm:px-8">
        <div className="flex items-center gap-4">
          <Avatar name={jamie.name} src={jamie.photo} className="size-14" />
          <div>
            <h2 className="font-display text-3xl leading-tight text-stone-900">Hi, I&apos;m Jamie.</h2>
            <p className="text-sm text-stone-500">I lead our welcome team. Ask me anything.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" placeholder="First name" />
          <Field label="Email or phone" value={contact} onChange={(e) => { setContact(e.target.value); setError(null); }} autoComplete="email" placeholder="So we can reply" />
        </div>
        <Textarea label="What's on your mind?" value={message} onChange={(e) => { setMessage(e.target.value); setError(null); }} placeholder="Is there parking for a minivan? What's the kids' check-in like? No question is too small." />
        {error && <p className="text-[13px] text-clay" role="alert">{error}</p>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4 text-sm text-stone-500">
            <a href={`tel:${church.phone}`} className="inline-flex items-center gap-1.5 hover:text-stone-900"><Phone className="size-4" />Call</a>
            <a href={`mailto:${church.email}`} className="inline-flex items-center gap-1.5 hover:text-stone-900"><Mail className="size-4" />Email</a>
          </div>
          <Button type="submit" size="lg"><MessageCircle />Send to Jamie</Button>
        </div>
      </form>
    </Sheet>
  );
}
