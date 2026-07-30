import { Container, Typography, Box, Card, CardContent, Stack, Avatar, Divider } from "@mui/material";
import { Phone, Mail, Building } from "lucide-react";
import { getRepository } from "@/app/lib/repo-instance";
import { Nav } from "@/app/components/Nav";
import { getInitials } from "@/app/lib/utils";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const repo = getRepository();
  const [specialists, lenders, pocs] = await Promise.all([
    repo.getAllSpecialists(),
    repo.getAllLenders(),
    repo.getAllPocs(),
  ]);

  return (
    <Box>
      <Nav active="people" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Team */}
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Team</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2, mb: 6 }}>
          {specialists.map((sp) => (
            <Card key={sp.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <Avatar sx={{ width: 40, height: 40, fontSize: "0.8rem", bgcolor: sp.avatarColor }}>{getInitials(sp.name)}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>{sp.name}</Typography>
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
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Lender Contacts</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2 }}>
          {pocs.map((poc) => {
            const lender = lenders.find((l) => l.id === poc.lenderId);
            return (
              <Card key={poc.id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Avatar sx={{ width: 40, height: 40, fontSize: "0.8rem", bgcolor: "grey.300" }}>{getInitials(poc.name)}</Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>{poc.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{poc.title}</Typography>
                    </Box>
                  </Box>
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Phone size={14} />
                      <Typography variant="body2" color="text.secondary">{poc.phone}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Mail size={14} />
                      <Typography variant="body2" color="text.secondary" noWrap>{poc.email}</Typography>
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