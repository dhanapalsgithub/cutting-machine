import { Box, Typography, Paper, Grid } from '@mui/material';
import ReactPlayer from 'react-player';

const Player: any = ReactPlayer;

// கிளைகளின் தகவல்கள்
const branchData = [
    { id: 1, name: 'Branch A - Main Office', streamUrl: 'http://your-server-ip:8080/hls/branchA.m3u8' },
    { id: 2, name: 'Branch B - Warehouse', streamUrl: 'http://your-server-ip:8080/hls/branchB.m3u8' },
];

export const CCTVSurvey = () => {
    return (
        <Box sx={{ p: 4, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Factory Live Surveillance
            </Typography>

            <Grid container spacing={3}>
                {branchData.map((branch) => (
                    <Grid size={{ xs: 12, md: 6 }} key={branch.id}>
                        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                                {branch.name}
                            </Typography>
                            
                            <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
                                {/* இப்போது Player வேரியபிளைப் பயன்படுத்தவும் */}
                                <Player
                                    url={branch.streamUrl}
                                    width="100%"
                                    height="350px"
                                    playing={true}
                                    controls={true}
                                    muted={true}
                                    config={{
                                        file: {
                                            attributes: {
                                                controlsList: 'nodownload'
                                            }
                                        }
                                    }}
                                />
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};