"use client";

import { Container, Typography, Box, Card, CardContent, Stack, Avatar } from "@mui/material";
import { Mail } from "lucide-react";
import { Nav } from "@/app/components/Nav";
import { ALL_USERS } from "@/app/lib/sf-leads";
import { colorFromString, getInitials } from "@/app/lib/utils";

export default function PeoplePage() {
  const specialists = ALL_USERS.map((owner) => ({
    id: owner.Id,
    name: owner.Name,
    email: owner.Email ?? "",
    avatarColor: colorFromString(owner.Id),
  }));

  return (
    <Box>
      <Nav active="people" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Team */}
        <Typography variant="h5" sx={{ fontWeight: 500, mb: 3 }}>Team</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2, mb: 6 }}>
          {specialists.map((sp) => (
            <Card key={sp.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <Avatar sx={{ width: 40, height: 40, fontSize: "0.8rem", bgcolor: sp.avatarColor }}>{getInitials(sp.name)}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{sp.name}</Typography>
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

      </Container>
    </Box>
  );
}