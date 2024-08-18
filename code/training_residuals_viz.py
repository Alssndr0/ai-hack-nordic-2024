import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

def train_animate():

    # store the vector mutations to plot 
    employee_mutation = []
    shift_mutation = []

    # Define the residual network model
    class ResidualNetwork(nn.Module):
        def __init__(self, input_size):
            super(ResidualNetwork, self).__init__()
            self.fc = nn.Linear(input_size, input_size)  # Identity layer
            self.residual = nn.Linear(input_size, input_size)  # Residual adjustment

        def forward(self, x):
            identity = self.fc(x)  # Identity mapping (original features)
            adjustment = self.residual(x)  # Learn adjustments (residuals)
            return identity + adjustment  # Combine original features with learned adjustments

    # Initialize the input size
    input_size = 10

    # Initialize the models for employee and shift features
    employee_model = ResidualNetwork(input_size)
    shift_model = ResidualNetwork(input_size)

    # Initialize the optimizer with L2 regularization (Ridge)
    optimizer = optim.Adam(
        list(employee_model.parameters()) + list(shift_model.parameters()), 
        lr=0.001, 
        weight_decay=1e-4  # L2 regularization
    )

    # Create the employee_vector and shift_vector with the given values
    employee_vector = torch.tensor([5, 4, 1, 1, 5, 1, 1, 1, 5, 1], dtype=torch.float32).unsqueeze(0)  # Add a batch dimension
    shift_vector = torch.tensor([2, 5, 2, 5, 1, 1, 2, 4, 1, 1], dtype=torch.float32).unsqueeze(0)  # Add a batch dimension

    # Custom constraint to ensure that adjustments are small
    def apply_constraints(model):
        for param in model.parameters():
            param.data = torch.clamp(param.data, -0.1, 0.1)  # Example constraint to keep adjustments small

    # Training loop
    epochs = 100  

    class CombinedLoss(nn.Module):
        def __init__(self, margin=1.0):
            super(CombinedLoss, self).__init__()
            self.cosine_loss = nn.CosineEmbeddingLoss(margin=margin)
            self.mse_loss = nn.MSELoss()

        def forward(self, x1, x2, target):
            # Cosine loss to align direction
            loss1 = self.cosine_loss(x1, x2, target)
            # MSE loss to match magnitude
            loss2 = self.mse_loss(x1, x2)
            # Combine the two losses
            return loss1 + loss2

    # Initialize the combined loss
    combined_loss = CombinedLoss()

    # During training, use the combined loss
    for epoch in range(epochs):
        labels = torch.ones((1,))  # Assuming all labels are "like"
        
        # Forward pass: compute embeddings and adjusted features
        adjusted_employee_vector = employee_model(employee_vector)
        adjusted_shift_vector = shift_model(shift_vector)
        
        # Compute embeddings using the adjusted vectors
        employee_embedding = adjusted_employee_vector
        shift_embedding = adjusted_shift_vector

        # append vector mutations
        employee_mutation.append(employee_embedding)
        shift_mutation.append(shift_embedding)
        
        # Compute the combined loss
        loss = combined_loss(employee_embedding, shift_embedding, labels)
        
        # Backward pass: compute gradient and update weights
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        # Apply constraints to keep the adjustments small
        apply_constraints(employee_model)
        apply_constraints(shift_model)

    # Convert the tensors to numpy arrays for plotting
    employee_mutation = [e.detach().numpy().flatten() for e in employee_mutation]
    shift_mutation = [s.detach().numpy().flatten() for s in shift_mutation]

    # Number of features
    num_features = employee_mutation[0].shape[0]

    # Angles for radar chart
    angles = np.linspace(0, 2 * np.pi, num_features, endpoint=False).tolist()
    angles += angles[:1]

    # Close the loop for radar chart
    employee_mutation = [np.append(e, e[0]) for e in employee_mutation]
    shift_mutation = [np.append(s, s[0]) for s in shift_mutation]

    # Plotting setup
    fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True))

    # Function to update the plot
    def animate(frame):
        ax.clear()
        
        # Employee mutation values for this frame
        values_employee = employee_mutation[frame]
        # Shift mutation values for this frame
        values_shift = shift_mutation[frame]
        
        # Plotting radar chart
        ax.fill(angles, values_employee, color='blue', alpha=0.25, label="Employee Embedding")
        ax.plot(angles, values_employee, color='blue', linewidth=2)
        ax.fill(angles, values_shift, color='red', alpha=0.25, label="Shift Embedding")
        ax.plot(angles, values_shift, color='red', linewidth=2)
        
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels([f"Feature {i+1}" for i in range(num_features)])
        ax.set_title("Employee vs Shift Embedding Convergence", size=16, color='black', y=1.1)
        ax.legend(loc='upper right')

    # Number of iterations
    iterations = len(employee_mutation)

    # Create the animation
    ani = FuncAnimation(fig, animate, frames=iterations, interval=500)

    # Display the animation
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    train_animate()
