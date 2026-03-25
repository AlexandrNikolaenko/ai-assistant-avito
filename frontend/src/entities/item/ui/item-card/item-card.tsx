"use client";

import type { AdListItem } from "../../model/items";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardMedia,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import { CATEGORY_LABELS } from "@/shared/constants/categories";
import "./item-card.css";

export function ItemCard(item: AdListItem) {
  const navigate = useNavigate();

  return (
    <Card
      key={item.id}
      elevation={0}
      style={{ margin: 0, border: "1px solid #F0F0F0", borderRadius: "16px" }}
    >
      <CardActionArea
        onClick={() => navigate(`/ads/${item.id}`)}
        sx={{
          height: "100%",
          justifyContent: "start",
          alignItems: "start",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        <CardMedia
          sx={{
            backgroundColor: "#FAFAFA",
            borderRadius: "8px",
            minWidth: "179px",
            aspectRatio: 179 / 132,
          }}
          component="img"
          image="/placeholder.png"
          alt="Paella dish"
        />
        <CardContent
          sx={{
            padding: "16px",
            paddingTop: "22px",
            width: "auto",
            height: "100%",
          }}
        >
          <Stack spacing={1} alignItems="flex-start" position={"relative"}>
            <Chip
              variant="outlined"
              sx={{
                position: "absolute",
                top: "-38px",
                backgroundColor: "#ffffff",
                borderColor: "#D9D9D9",
                borderRadius: "6px",
              }}
              label={CATEGORY_LABELS[item.category]}
            />
            <Typography
              align="left"
              variant="body2"
              sx={{ lineHeight: "24px", margin: 0, fontSize: "16px" }}
              marginTop={0}
            >
              {item.title}
            </Typography>
            <Typography
              variant="body2"
              marginTop={0}
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "16px",
                margin: 0,
                fontWeight: 600,
                opacity: 0.45,
              }}
            >
              {item.price.toLocaleString("ru-RU")} ₽
            </Typography>
            {item.needsRevision ? (
              <div className="chip">
                <div></div>
                <span>Требует доработок</span>
              </div>
            ) : null}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export function ListItemCard(item: AdListItem) {
  const navigate = useNavigate();

  return (
    <Card
      key={item.id}
      elevation={0}
      style={{ margin: 0, border: "1px solid #F0F0F0", borderRadius: "16px" }}
    >
      <CardActionArea
        onClick={() => navigate(`/ads/${item.id}`)}
        sx={{
          height: "100%",
          justifyContent: "start",
          alignItems: "start",
          display: "flex",
          flexDirection: {
            sm: "row",
            xs: "column",
          },
          gap: 0,
        }}
      >
        <CardMedia
          sx={{
            backgroundColor: "#FAFAFA",
            borderRadius: "8px",
            width: "179px",
            height: "133px",
            aspectRatio: "179/132",
          }}
          component="img"
          image="/placeholder.png"
          alt="Paella dish"
        />
        <CardContent sx={{ padding: "16px 22px", width: "100%" }}>
          <Stack spacing={1} alignItems="flex-start" position={"relative"}>
            <span
              style={{
                color: "#848388",
                fontSize: "14px",
              }}
            >
              {CATEGORY_LABELS[item.category]}
            </span>
            <Typography
              align="left"
              variant="body2"
              sx={{
                lineHeight: "24px",
                margin: 0,
                padding: 0,
                fontSize: "16px",
              }}
              marginTop={0}
              style={{ margin: 0 }}
            >
              {item.title}
            </Typography>
            <Typography
              variant="body2"
              marginTop={0}
              sx={{
                fontFamily: "Inter, sans-serif",
                padding: 0,
                fontSize: "16px",
                margin: 0,
                fontWeight: 600,
                opacity: 0.45,
              }}
              style={{ margin: 0 }}
            >
              {item.price.toLocaleString("ru-RU")} ₽
            </Typography>
            {item.needsRevision ? (
              <div className="chip">
                <div></div>
                <span>Требует доработок</span>
              </div>
            ) : null}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
