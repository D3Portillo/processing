import { Container, Typography, Box, Card, CardContent, Stack, Avatar } from "@mui/material";
import { Phone, Mail, Building, Users } from "lucide-react";
import { getAllSpecialists, getAllLenders, getAllLenderContacts } from "@/app/lib/mock-data";
import { Nav } from "@/app/components/Nav";
import { getInitials } from "@/app/lib/utils";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const specialists = getAllSpecialists();
  const lenders = getAllLenders();
  const contacts = getAllLenderContacts();

  return (
    <Box>
      <Nav active="people" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Team */}
        <Typography variant="h5"  sx={{ mb: 3, fontWeight: 700}}>Team</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2, mb: 6 }}>
          {specialists.map((sp) => (
            <Card key={sp.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <Avatar sx={{ width: 40, height: 40, fontSize: "0.8rem", bgcolor: sp.avatarColor }}>{getInitials(sp.name)}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{sp.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Specialist</Typography>
                  </Box>
                </Box>
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Mail size={14} />
                    <Typography variant="body2" color="text.secondary" noWrap>{sp.email}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Lender Contacts */}
        <Typography variant="h5"  sx={{ mb: 3, fontWeight: 700}}>Lender Contacts</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2 }}>
          {contacts.map((contact) => {
            const lender = lenders.find((l) => l.id === contact.lenderId);
            return (
              <Card key={contact.id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: "grey.300" }}>
                      <Users size={18} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{contact.department}</Typography>
                      {contact.name ? (
                        <Typography variant="caption" color="text.secondary">{contact.name}</Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">Department contact</Typography>
                      )}
                    </Box>
                  </Box>
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Phone size={14} />
                      <Typography variant="body2" color="text.secondary">{contact.phone}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Mail size={14} />
                      <Typography variant="body2" color="text.secondary" noWrap>{contact.email}</Typography>
                    </Box>
                    {lender && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Building size={14} />
                        <Typography variant="caption" color="text.secondary">{lender.name}</Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}