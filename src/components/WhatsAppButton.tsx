import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const WhatsAppButton = () => {
  const phoneNumber = "923485466204";
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      setMessage("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl"
          aria-label="Contact us on WhatsApp"
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How can I help you?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            className="w-full bg-[#25D366] hover:bg-[#20BA5A]"
            disabled={!message.trim()}
          >
            <Send className="mr-2 h-4 w-4" />
            Send to WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppButton;
